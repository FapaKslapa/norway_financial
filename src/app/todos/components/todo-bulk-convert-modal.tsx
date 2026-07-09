"use client";

import { AnimatePresence, m } from "framer-motion";
import { Check, X } from "lucide-react";
import type React from "react";
import { useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { MoneyInput } from "@/components/ui/money-input";

type TodoItem = {
  id: string;
  title: string;
  categoryId: string | null;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type TodoBulkConvertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTodos: TodoItem[];
  categories: Category[];
  onConvertBulk: (data: {
    todoIds: string[];
    amount: number;
    currency: string;
    date: string;
    description: string;
    categoryId: string | null;
  }) => Promise<void>;
};

type FormState = {
  txAmount: string;
  txCurrency: string;
  txDate: string;
  txDescription: string;
  txCategoryId: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<FormState> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

type TodoBulkConvertFormProps = {
  selectedTodos: TodoItem[];
  categories: Category[];
  onClose: () => void;
  onConvertBulk: TodoBulkConvertModalProps["onConvertBulk"];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

function TodoBulkConvertForm({
  selectedTodos,
  categories,
  onClose,
  onConvertBulk,
  displayCurrency,
  convertCurrency,
}: TodoBulkConvertFormProps) {
  const [state, dispatch] = useReducer(formReducer, null, () => {
    let estTotal = 0;
    for (const item of selectedTodos) {
      if (item.estimatedAmount) {
        const amt = parseFloat(item.estimatedAmount);
        const cur = item.estimatedCurrency || "EUR";
        const converted = convertCurrency(amt, cur, displayCurrency);
        estTotal += converted;
      }
    }

    const titles = selectedTodos.map((t) => t.title).join(", ");
    const firstCatId = selectedTodos.find((t) => t.categoryId)?.categoryId || "";

    return {
      txAmount: estTotal > 0 ? estTotal.toFixed(2) : "",
      txCurrency: displayCurrency,
      txDate: new Date().toISOString().substring(0, 10),
      txDescription: `Spesa: ${titles}`,
      txCategoryId: firstCatId,
      isSubmitting: false,
    };
  });

  const {
    txAmount,
    txCurrency,
    txDate,
    txDescription,
    txCategoryId,
    isSubmitting,
  } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTodos.length === 0 || !txAmount || isSubmitting) return;

    dispatch({ type: "SET_FIELD", field: "isSubmitting", value: true });
    try {
      await onConvertBulk({
        todoIds: selectedTodos.map((t) => t.id),
        amount: parseFloat(txAmount),
        currency: txCurrency,
        date: new Date(txDate).toISOString(),
        description: txDescription.trim() || "Spesa cumulativa",
        categoryId: txCategoryId || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-(--card-solid) border border-(--card-border) w-full max-w-[420px] rounded-3xl p-6 shadow-2xl text-foreground max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center pb-4 border-b border-(--card-border) mb-4">
          <div className="flex flex-col">
            <h3 className="font-extrabold text-base">
              Importazione di Massa
            </h3>
            <span className="text-[10px] text-(--text-muted) font-semibold mt-0.5">
              Importa {selectedTodos.length} articoli come un'unica spesa
            </span>
          </div>
          <button
            type="button"
            aria-label="Chiudi"
            className="text-(--text-muted) rounded-lg hover:bg-neutral-500/10 h-7 w-7 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col bg-neutral-500/5 p-3 rounded-2xl border border-(--card-border) text-xs gap-1.5 max-h-[100px] overflow-y-auto scrollbar-none">
            <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider">
              Articoli selezionati ({selectedTodos.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedTodos.map((todo) => (
                <span
                  key={todo.id}
                  className="px-2 py-0.5 bg-neutral-500/10 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-(--card-border)"
                >
                  <Check size={8} className="text-emerald-500 stroke-[3]" />
                  {todo.title}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
              Descrizione Transazione
            </span>
            <input
              type="text"
              aria-label="Descrizione transazione"
              value={txDescription}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "txDescription", value: e.target.value })}
              placeholder="Es. Spesa settimanale al supermercato"
              required
              className="text-xs text-foreground bg-neutral-500/5 dark:bg-zinc-800/30 border border-(--card-border) focus:border-blue-500/50 h-10 px-3.5 rounded-xl outline-none font-semibold transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 flex flex-col gap-1.5">
              <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                Prezzo Totale
              </span>
              <MoneyInput
                value={txAmount}
                onChange={(val) => dispatch({ type: "SET_FIELD", field: "txAmount", value: val })}
                currency={txCurrency}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                Valuta
              </span>
              <CurrencySelect
                value={txCurrency}
                onChange={(val) => dispatch({ type: "SET_FIELD", field: "txCurrency", value: val })}
              />
            </div>
          </div>

          {txAmount &&
            !Number.isNaN(parseFloat(txAmount)) &&
            txCurrency !== displayCurrency && (
              <div className="py-2 px-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-blue-500 font-bold flex justify-between">
                <span>Totale convertito:</span>
                <span>
                  {convertCurrency(
                    parseFloat(txAmount),
                    txCurrency,
                    displayCurrency,
                  ).toFixed(2)}{" "}
                  {displayCurrency}
                </span>
              </div>
            )}

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                Categoria Spesa
              </span>
              <CategorySelect
                value={txCategoryId}
                onChange={(val) => dispatch({ type: "SET_FIELD", field: "txCategoryId", value: val })}
                categories={categories}
                triggerClassName="h-10 text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                Data Spesa
              </span>
              <CustomDatePicker
                value={txDate}
                onChange={(val) => dispatch({ type: "SET_FIELD", field: "txDate", value: val })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !txAmount}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-11 rounded-xl cursor-pointer mt-2 shadow-sm border-0 w-full disabled:opacity-50 flex items-center justify-center transition-all"
          >
            {isSubmitting ? "Importazione..." : "Conferma Spesa Cumulativa"}
          </button>
        </form>
      </m.div>
    </div>
  );
}

export function TodoBulkConvertModal({
  isOpen,
  onClose,
  selectedTodos,
  categories,
  onConvertBulk,
}: TodoBulkConvertModalProps) {
  const { convertCurrency, displayCurrency } = useDashboard();

  return (
    <AnimatePresence>
      {isOpen && selectedTodos.length > 0 && (
        <TodoBulkConvertForm
          selectedTodos={selectedTodos}
          categories={categories}
          onClose={onClose}
          onConvertBulk={onConvertBulk}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
        />
      )}
    </AnimatePresence>
  );
}
