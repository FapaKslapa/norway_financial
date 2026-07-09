"use client";

import { m } from "framer-motion";
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronRight,
  SplitSquareHorizontal,
  Type,
  Users,
  Wallet,
} from "lucide-react";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { CustomSelect } from "@/components/ui/custom-select";
import { MoneyInput } from "@/components/ui/money-input";
import { formatCurrency } from "@/lib/utils";
import { ShareTypeToggle } from "./share-type-toggle";
import type { FormState, Friend, Group } from "./types";

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

type SharedExpenseFormStepProps = {
  state: FormState;
  set: (payload: Partial<FormState>) => void;
  friends: Friend[];
  groups: Group[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  parsedAmount: number;
  amountNok: number;
  groupShareNok: number;
  splitSummaryLabel: string;
  myNok: number;
  friendNok: number;
  canSave: boolean;
  handleClose: () => void;
  handleSave: () => Promise<void>;
};

export function SharedExpenseFormStep({
  state,
  set,
  friends,
  groups,
  displayCurrency,
  convertCurrency,
  parsedAmount,
  amountNok,
  groupShareNok,
  splitSummaryLabel,
  myNok,
  friendNok,
  canSave,
  handleClose,
  handleSave,
}: SharedExpenseFormStepProps) {
  const showConversion = parsedAmount > 0 && state.currency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, state.currency, displayCurrency)
    : null;

  return (
    <m.div
      key="form-step"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className="px-6 pt-5 pb-6 flex flex-col gap-4"
    >
      {/* Share type toggle */}
      <ShareTypeToggle
        shareType={state.shareType}
        onSelectFriend={() => set({ shareType: "friend", groupId: "" })}
        onSelectGroup={() => set({ shareType: "group", friendId: "" })}
      />

      {/* Friend / Group picker */}
      {state.shareType === "friend" ? (
        <div>
          <FieldLabel icon={Users}>Amico con cui dividere</FieldLabel>
          <CustomSelect
            value={state.friendId}
            onChange={(v) => set({ friendId: v })}
            placeholder="Seleziona amico..."
            options={friends.map((f) => ({
              value: f.user.id,
              label: f.user.name,
            }))}
          />
        </div>
      ) : (
        <div>
          <FieldLabel icon={Users}>Gruppo con cui dividere</FieldLabel>
          <CustomSelect
            value={state.groupId}
            onChange={(v) => set({ groupId: v })}
            placeholder="Seleziona gruppo..."
            options={groups.map((g) => ({
              value: g.id,
              label: g.name,
            }))}
          />
        </div>
      )}

      {/* Description */}
      <div>
        <FieldLabel icon={Type}>Descrizione</FieldLabel>
        <div className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center border border-(--card-border) w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
          <input
            type="text"
            aria-label="Descrizione spesa"
            placeholder={
              state.shareType === "group"
                ? "Es. Spesa per festa, AirBnB..."
                : "Es. Cena ristorante..."
            }
            value={state.desc}
            onChange={(e) => set({ desc: e.target.value })}
            className="text-sm text-foreground flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-(--text-muted)"
          />
        </div>
      </div>

      {/* Amount + Currency */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <FieldLabel icon={Wallet}>Importo totale</FieldLabel>
          <MoneyInput
            value={state.amount}
            onChange={(v) => set({ amount: v })}
            currency={state.currency}
            required
            className="h-11"
            inputClassName="text-sm font-black"
          />
        </div>
        <div>
          <FieldLabel icon={ArrowLeftRight}>Valuta</FieldLabel>
          <CurrencySelect
            value={state.currency}
            onChange={(v) => set({ currency: v })}
          />
        </div>
      </div>

      {/* Conversion hint */}
      {convertedAmount !== null && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-(--text-muted)">
            <ArrowLeftRight size={11} className="text-blue-500" />
            Conversione stimata
          </div>
          <div className="flex items-center gap-1.5 text-xs font-black">
            <span className="text-(--text-muted)">
              {parsedAmount.toFixed(2)} {state.currency}
            </span>
            <span className="text-neutral-400">→</span>
            <span className="text-blue-500">
              {convertedAmount.toFixed(2)} {displayCurrency}
            </span>
          </div>
        </div>
      )}

      {/* Date */}
      <div>
        <FieldLabel icon={CalendarDays}>Data</FieldLabel>
        <CustomDatePicker
          value={state.date}
          onChange={(v) => set({ date: v })}
        />
      </div>

      {/* Split preview shortcut */}
      {canSave && amountNok > 0 && (
        <button
          type="button"
          onClick={() => set({ step: "split" })}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl hover:bg-blue-500/10 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
              <SplitSquareHorizontal size={13} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-foreground">
                Modalità divisione
              </span>
              <span className="text-[10px] text-blue-400 font-semibold">
                {splitSummaryLabel}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              {state.shareType === "group" ? (
                <span className="text-blue-500">
                  {formatCurrency(
                    convertCurrency(groupShareNok, "NOK", displayCurrency),
                    displayCurrency,
                  )}{" "}
                  a testa
                </span>
              ) : (
                <>
                  <span className="text-blue-500">{myNok.toFixed(0)} NOK</span>
                  <span className="text-(--text-muted)">/</span>
                  <span className="text-blue-500">
                    {friendNok.toFixed(0)} NOK
                  </span>
                </>
              )}
            </div>
            <ChevronRight
              size={14}
              className="text-(--text-muted) group-hover:text-blue-400 transition-colors"
            />
          </div>
        </button>
      )}

      {/* Form actions */}
      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 h-12 text-xs font-bold text-foreground border border-(--card-border) hover:bg-neutral-500/10 rounded-xl cursor-pointer bg-transparent transition-all"
        >
          Annulla
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="flex-[2] h-12 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer shadow-sm border-0 disabled:opacity-50 transition-all"
        >
          Aggiungi Spesa
        </button>
      </div>
    </m.div>
  );
}
