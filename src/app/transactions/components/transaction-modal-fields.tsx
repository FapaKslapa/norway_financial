"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  ArrowLeftRight,
  CalendarDays,
  Tag,
  TrendingDown,
  TrendingUp,
  Type,
  Wallet,
} from "lucide-react";
import type React from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { MoneyInput } from "@/components/ui/money-input";
import { APPLE_COLORS, CURATED_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; icon: string; color: string };

// ---------------------------------------------------------------------------
// FieldLabel
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// TransactionTypeToggle
// ---------------------------------------------------------------------------
export function TransactionTypeToggle({
  value,
  onChange,
}: {
  value: "expense" | "income";
  onChange: (v: "expense" | "income") => void;
}) {
  return (
    <div>
      <FieldLabel icon={Tag}>Tipo operazione</FieldLabel>
      <div className="relative flex p-1 bg-neutral-500/5 rounded-xl border border-(--card-border) h-11 overflow-hidden select-none">
        <div
          className={cn(
            "absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg transition-all duration-300 shadow-sm",
            value === "expense"
              ? "left-1 bg-rose-500"
              : "left-[calc(50%+2px)] bg-emerald-500",
          )}
        />
        <button
          type="button"
          onClick={() => onChange("expense")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
            value === "expense" ? "text-white" : "text-(--text-muted)",
          )}
        >
          <TrendingDown size={12} /> Spesa
        </button>
        <button
          type="button"
          onClick={() => onChange("income")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
            value === "income" ? "text-white" : "text-(--text-muted)",
          )}
        >
          <TrendingUp size={12} /> Guadagno
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DescriptionField
// ---------------------------------------------------------------------------
export function DescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel icon={Type}>Descrizione</FieldLabel>
      <div className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center border border-(--card-border) w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
        <input
          type="text"
          aria-label="Descrizione transazione"
          placeholder="Es. Cena, Stipendio, Affitto, Supermercato..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="text-sm text-foreground flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-(--text-muted)"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AmountCurrencyRow
// ---------------------------------------------------------------------------
export function AmountCurrencyRow({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
}: {
  amount: string;
  currency: string;
  onAmountChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className="col-span-2">
        <FieldLabel icon={Wallet}>Importo</FieldLabel>
        <MoneyInput
          value={amount}
          onChange={onAmountChange}
          currency={currency}
          required
        />
      </div>
      <div>
        <FieldLabel icon={ArrowLeftRight}>Valuta</FieldLabel>
        <CurrencySelect value={currency} onChange={onCurrencyChange} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConversionBadge
// ---------------------------------------------------------------------------
export function ConversionBadge({
  parsedAmount,
  convertedAmount,
  sourceCurrency,
  targetCurrency,
}: {
  parsedAmount: number;
  convertedAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-(--text-muted)">
        <ArrowLeftRight size={11} className="text-blue-500" />
        Conversione stimata
      </div>
      <div className="flex items-center gap-1.5 text-xs font-black">
        <span className="text-(--text-muted)">
          {parsedAmount.toFixed(2)} {sourceCurrency}
        </span>
        <span className="text-neutral-400">→</span>
        <span className="text-blue-500">
          {convertedAmount.toFixed(2)} {targetCurrency}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategorySection
// ---------------------------------------------------------------------------
export function CategorySection({
  categoryId,
  categories,
  onCategoryChange,
  isInlineCatOpen,
  onToggleInlineCat,
  newCatName,
  onNewCatNameChange,
  newCatColor,
  onNewCatColorChange,
  newCatIcon,
  onNewCatIconChange,
  onCreateCategory,
}: {
  categoryId: string;
  categories: Category[];
  onCategoryChange: (id: string) => void;
  isInlineCatOpen: boolean;
  onToggleInlineCat: () => void;
  newCatName: string;
  onNewCatNameChange: (v: string) => void;
  newCatColor: string;
  onNewCatColorChange: (v: string) => void;
  newCatIcon: string;
  onNewCatIconChange: (v: string) => void;
  onCreateCategory: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <FieldLabel icon={Tag}>Categoria</FieldLabel>
        <button
          type="button"
          className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer border-0 bg-transparent -mt-1.5"
          onClick={onToggleInlineCat}
        >
          {isInlineCatOpen ? "Indietro" : "Crea nuova"}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {isInlineCatOpen ? (
          <m.div
            key="cat-creator"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 p-3.5 bg-neutral-500/5 border border-(--card-border) rounded-2xl overflow-hidden"
          >
            <div className="bg-(--card-solid) h-10 px-3 rounded-xl flex items-center border border-(--card-border) w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <input
                type="text"
                aria-label="Nome categoria"
                placeholder="Nome categoria"
                value={newCatName}
                onChange={(e) => onNewCatNameChange(e.target.value)}
                className="text-sm text-foreground flex-1 bg-transparent border-0 outline-none w-full placeholder:text-(--text-muted)"
              />
            </div>
            <div>
              <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider block mb-1.5">
                Colore
              </span>
              <div className="flex flex-wrap gap-1.5">
                {APPLE_COLORS.map((col) => (
                  <button
                    type="button"
                    aria-label={`Seleziona colore ${col}`}
                    key={col}
                    className={cn(
                      "w-5 h-5 rounded-full cursor-pointer transition-all border-2",
                      newCatColor === col
                        ? "border-foreground scale-110 shadow"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: col }}
                    onClick={() => onNewCatColorChange(col)}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider block mb-1.5">
                Icona
              </span>
              <div className="flex flex-wrap gap-1.5 bg-(--card-solid) p-2 rounded-xl border border-(--card-border) max-h-[72px] overflow-y-auto">
                {CURATED_ICONS.map((ico) => (
                  <button
                    type="button"
                    key={ico}
                    className={cn(
                      "p-1 rounded-lg cursor-pointer transition-all",
                      newCatIcon === ico
                        ? "bg-blue-500 text-white"
                        : "text-foreground hover:bg-neutral-500/10",
                    )}
                    onClick={() => onNewCatIconChange(ico)}
                    aria-label={`Seleziona icona ${ico}`}
                  >
                    <CategoryIcon name={ico} size={14} />
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="bg-blue-500 text-white text-[10px] font-bold border-0 h-8 rounded-xl cursor-pointer hover:opacity-90 w-full flex items-center justify-center transition-all"
              onClick={onCreateCategory}
            >
              Crea Categoria
            </button>
          </m.div>
        ) : (
          <CategorySelect
            value={categoryId}
            onChange={onCategoryChange}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DateField
// ---------------------------------------------------------------------------
export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel icon={CalendarDays}>Data</FieldLabel>
      <CustomDatePicker value={value} onChange={onChange} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SubmitButton
// ---------------------------------------------------------------------------
export function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="px-6 pb-5 pt-3 border-t border-(--card-border) shrink-0 bg-(--card-solid) md:rounded-b-3xl">
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-foreground text-background font-bold text-sm h-12 rounded-xl cursor-pointer hover:opacity-90 shadow-sm w-full border-0 disabled:opacity-50 flex items-center justify-center transition-all"
      >
        {isSubmitting ? "Salvataggio..." : "Salva Transazione"}
      </button>
    </div>
  );
}
