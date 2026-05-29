"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { MoneyInput } from "@/components/ui/money-input";

type TodoItem = {
  id: string;
  title: string;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

type TodoConvertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  todoItem: TodoItem | null;
  onConvert: (data: {
    todoId: string;
    amount: number;
    currency: string;
    date: string;
  }) => Promise<void>;
};

export function TodoConvertModal({
  isOpen,
  onClose,
  todoItem,
  onConvert,
}: TodoConvertModalProps) {
  const { convertCurrency, displayCurrency } = useDashboard();
  const [txAmount, setTxAmount] = useState("");
  const [txCurrency, setTxCurrency] = useState<string>(displayCurrency);
  const [txDate, setTxDate] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (todoItem) {
      const estAmountNum = todoItem.estimatedAmount
        ? parseFloat(todoItem.estimatedAmount)
        : null;
      setTxAmount(estAmountNum ? estAmountNum.toString() : "");
      setTxCurrency(todoItem.estimatedCurrency || displayCurrency);
      setTxDate(new Date().toISOString().substring(0, 10));
    }
  }, [todoItem, displayCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoItem || !txAmount || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConvert({
        todoId: todoItem.id,
        amount: parseFloat(txAmount),
        currency: txCurrency,
        date: new Date(txDate).toISOString(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && todoItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-(--card-solid) border border-(--card-border) w-full max-w-[360px] rounded-3xl p-6 shadow-2xl text-foreground"
          >
            <div className="flex justify-between items-center pb-4 border-b border-(--card-border) mb-4">
              <h3 className="font-extrabold text-base">Importa Spesa</h3>
              <button
                type="button"
                className="text-(--text-muted) rounded-lg hover:bg-neutral-500/10 h-7 w-7 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col bg-neutral-500/5 p-3 rounded-xl border border-(--card-border) text-xs gap-1.5">
                <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider">
                  Articolo da completare
                </span>
                <span className="font-bold text-foreground">
                  {todoItem.title}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                    Importo Reale
                  </span>
                  <MoneyInput
                    value={txAmount}
                    onChange={setTxAmount}
                    currency={txCurrency}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                    Valuta
                  </span>
                  <CurrencySelect value={txCurrency} onChange={setTxCurrency} />
                </div>
              </div>

              {txAmount &&
                !Number.isNaN(parseFloat(txAmount)) &&
                txCurrency !== displayCurrency && (
                  <div className="py-2 px-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-blue-500 font-bold flex justify-between">
                    <span>Stima convertito:</span>
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

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                  Data Spesa
                </span>
                <CustomDatePicker
                  value={txDate}
                  onChange={(setDateVal) => setTxDate(setDateVal)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-foreground text-background font-semibold text-xs h-11 rounded-xl cursor-pointer hover:opacity-90 mt-2 shadow-sm border-0 w-full disabled:opacity-50"
              >
                {isSubmitting ? "Importazione..." : "Conferma Spesa & Archivia"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
