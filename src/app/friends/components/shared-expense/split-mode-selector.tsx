"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  ChevronRight,
  Hash,
  Minus,
  Percent,
  Ruler,
  SplitSquareHorizontal,
} from "lucide-react";
import type React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { SplitMode } from "./types";

type SplitOption = {
  id: SplitMode;
  label: string;
  description: string;
  icon: React.ElementType;
};

const SPLIT_OPTIONS: SplitOption[] = [
  { id: "half", label: "Metà", description: "50% a testa", icon: Minus },
  {
    id: "percentage",
    label: "Percentuale",
    description: "Quota personalizzata",
    icon: Percent,
  },
  {
    id: "exact",
    label: "Importo esatto",
    description: "Cifra precisa",
    icon: Ruler,
  },
  {
    id: "thirds",
    label: "In terzi",
    description: "1/3 ciascuno",
    icon: SplitSquareHorizontal,
  },
  {
    id: "custom_n",
    label: "In N parti",
    description: "Dividi per N persone",
    icon: Hash,
  },
];

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-1.5">
      <Icon size={11} className="opacity-60" />
      {children}
    </span>
  );
}

type Props = {
  splitMode: SplitMode;
  percentage: string;
  exactNok: string;
  n: string;
  friendName?: string;
  myNok: number;
  friendNok: number;
  myPct: number;
  friendPct: number;
  amountNok: number;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onChangeSplitMode: (mode: SplitMode) => void;
  onChangePercentage: (val: string) => void;
  onChangeExactNok: (val: string) => void;
  onChangeN: (val: string) => void;
};

export function SplitModeSelector({
  splitMode,
  percentage,
  exactNok,
  n,
  friendName,
  myNok,
  friendNok,
  myPct,
  friendPct,
  amountNok,
  displayCurrency,
  convertCurrency,
  onChangeSplitMode,
  onChangePercentage,
  onChangeExactNok,
  onChangeN,
}: Props) {
  return (
    <>
      {/* Split option list */}
      <div>
        <FieldLabel icon={SplitSquareHorizontal}>
          Modalità di divisione
        </FieldLabel>
        <div className="flex flex-col gap-1.5">
          {SPLIT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = splitMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeSplitMode(opt.id)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all cursor-pointer text-left w-full",
                  active
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-neutral-500/5 border-(--card-border) hover:border-blue-500/20 hover:bg-blue-500/5",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    active
                      ? "bg-blue-500 text-white"
                      : "bg-neutral-500/10 text-(--text-muted)",
                  )}
                >
                  <Icon size={14} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      active ? "text-foreground" : "text-(--text-muted)",
                    )}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-(--text-muted)">
                    {opt.description}
                  </span>
                </div>
                {active && (
                  <ChevronRight size={14} className="text-blue-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic input for each split mode */}
      <AnimatePresence mode="wait">
        {splitMode === "percentage" && (
          <m.div
            key="pct"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FieldLabel icon={Percent}>Quota di {friendName} (%)</FieldLabel>
            <div className="flex items-center gap-3 px-4 py-3 bg-neutral-500/5 rounded-2xl border border-(--card-border)">
              <input
                type="range"
                aria-label="Percentuale quota"
                min="1"
                max="99"
                value={percentage}
                onChange={(e) => onChangePercentage(e.target.value)}
                className="flex-1 accent-blue-500 cursor-pointer h-1.5"
              />
              <div className="flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5 min-w-[58px]">
                <input
                  type="number"
                  aria-label="Percentuale quota numerica"
                  min="1"
                  max="99"
                  value={percentage}
                  onChange={(e) => onChangePercentage(e.target.value)}
                  className="w-8 bg-transparent border-0 outline-none text-sm font-black text-blue-500 text-center"
                />
                <Percent size={10} className="text-blue-400" />
              </div>
            </div>
          </m.div>
        )}

        {splitMode === "exact" && (
          <m.div
            key="exact"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FieldLabel icon={Ruler}>
              Importo a carico di {friendName}
            </FieldLabel>
            <div className="bg-neutral-500/5 h-11 px-3 rounded-xl flex items-center border border-(--card-border) w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <input
                type="number"
                aria-label="Importo esatto in NOK"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={exactNok}
                onChange={(e) => onChangeExactNok(e.target.value)}
                className="text-sm font-black text-foreground flex-1 bg-transparent border-0 outline-none min-w-0 placeholder:text-(--text-muted)"
              />
              <span className="text-[10px] text-(--text-muted) font-bold ml-1 shrink-0">
                NOK
              </span>
            </div>
          </m.div>
        )}

        {splitMode === "custom_n" && (
          <m.div
            key="custom_n"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <FieldLabel icon={Hash}>Numero totale di persone</FieldLabel>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChangeN(String(num))}
                  className={cn(
                    "flex-1 h-11 rounded-xl text-sm font-black border transition-all cursor-pointer",
                    n === String(num)
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                      : "bg-neutral-500/5 text-foreground border-(--card-border) hover:border-blue-500/30",
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Preview bar */}
      {amountNok > 0 && (
        <div className="flex flex-col gap-2">
          <FieldLabel icon={SplitSquareHorizontal}>
            Anteprima divisione
          </FieldLabel>
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            <m.div
              className="bg-blue-500 rounded-l-full"
              animate={{ width: `${myPct}%` }}
              transition={{ duration: 0.3 }}
            />
            <m.div
              className="bg-blue-500 rounded-r-full"
              animate={{ width: `${friendPct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-wide">
                  Tu paghi
                </span>
              </div>
              <span className="text-base font-black text-blue-500">
                {formatCurrency(
                  convertCurrency(myNok, "NOK", displayCurrency),
                  displayCurrency,
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-wide truncate">
                  {friendName ?? "Amico"}
                </span>
              </div>
              <span className="text-base font-black text-blue-500">
                {formatCurrency(
                  convertCurrency(friendNok, "NOK", displayCurrency),
                  displayCurrency,
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
