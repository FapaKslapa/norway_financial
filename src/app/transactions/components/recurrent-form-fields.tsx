"use client";

import {
  ArrowLeftRight,
  CalendarDays,
  Tag,
  TrendingDown,
  TrendingUp,
  Type,
  Wallet,
} from "lucide-react";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { CustomSelect } from "@/components/ui/custom-select";
import { MoneyInput } from "@/components/ui/money-input";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

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

type RecurrentFormFieldsProps = {
  description: string;
  setDescription: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  type: "expense" | "income";
  setType: (v: "expense" | "income") => void;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  setFrequency: (v: "daily" | "weekly" | "monthly" | "yearly") => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  categories: CategoryOption[];
};

export function RecurrentFormFields({
  description,
  setDescription,
  amount,
  setAmount,
  currency,
  setCurrency,
  categoryId,
  setCategoryId,
  type,
  setType,
  frequency,
  setFrequency,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categories,
}: RecurrentFormFieldsProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 pt-5 pb-5 flex flex-col gap-4">
      {/* Descrizione */}
      <div>
        <FieldLabel icon={Type}>Descrizione</FieldLabel>
        <div className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center border border-(--card-border) w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
          <input
            type="text"
            aria-label="Descrizione transazione ricorrente"
            required
            placeholder="Es. Stipendio, Affitto, Netflix..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-sm text-foreground flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-(--text-muted)"
          />
        </div>
      </div>

      {/* Frequenza e Tipo in Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <FieldLabel icon={CalendarDays}>Frequenza</FieldLabel>
          <CustomSelect
            value={frequency}
            onChange={(val) => setFrequency(val as typeof frequency)}
            options={[
              { value: "daily", label: "Giornaliero" },
              { value: "weekly", label: "Settimanale" },
              { value: "monthly", label: "Mensile" },
              { value: "yearly", label: "Annuale" },
            ]}
          />
        </div>

        <div>
          <FieldLabel icon={Tag}>Tipo regola</FieldLabel>
          <div className="relative flex p-1 bg-neutral-500/5 rounded-xl border border-(--card-border) h-11 overflow-hidden select-none">
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg transition-all duration-300 shadow-sm",
                type === "expense"
                  ? "left-1 bg-rose-500"
                  : "left-[calc(50%+2px)] bg-emerald-500",
              )}
            />
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 text-[11px] font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                type === "expense" ? "text-white" : "text-(--text-muted)",
              )}
            >
              <TrendingDown size={11} /> Spesa
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 text-[11px] font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                type === "income" ? "text-white" : "text-(--text-muted)",
              )}
            >
              <TrendingUp size={11} /> Entrata
            </button>
          </div>
        </div>
      </div>

      {/* Categoria */}
      <div>
        <FieldLabel icon={Tag}>Categoria</FieldLabel>
        <CategorySelect
          value={categoryId}
          onChange={setCategoryId}
          categories={categories}
        />
      </div>

      {/* Date Inizio e Fine in Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <FieldLabel icon={CalendarDays}>Data Inizio</FieldLabel>
          <CustomDatePicker value={startDate} onChange={setStartDate} />
        </div>

        <div>
          <FieldLabel icon={CalendarDays}>Data Fine (Opzionale)</FieldLabel>
          <CustomDatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="Senza fine"
          />
        </div>
      </div>

      {/* Importo e Valuta in Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="col-span-2">
          <FieldLabel icon={Wallet}>Importo</FieldLabel>
          <MoneyInput
            value={amount}
            onChange={setAmount}
            currency={currency}
            required
          />
        </div>
        <div>
          <FieldLabel icon={ArrowLeftRight}>Valuta</FieldLabel>
          <CurrencySelect value={currency} onChange={setCurrency} />
        </div>
      </div>
    </div>
  );
}
