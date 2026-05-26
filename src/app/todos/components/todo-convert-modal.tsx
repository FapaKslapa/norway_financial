"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { CustomDatePicker } from "../../../components/ui/custom-datepicker";
import { CustomSelect } from "../../../components/ui/custom-select";
import { MoneyInput } from "../../../components/ui/money-input";

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
  exchangeRate: number;
  onConvert: (data: {
    todoId: string;
    amount: number;
    currency: "EUR" | "NOK";
    date: string;
  }) => Promise<void>;
};

export function TodoConvertModal({
  isOpen,
  onClose,
  todoItem,
  exchangeRate,
  onConvert,
}: TodoConvertModalProps) {
  const [txAmount, setTxAmount] = useState("");
  const [txCurrency, setTxCurrency] = useState<"EUR" | "NOK">("NOK");
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
      setTxCurrency((todoItem.estimatedCurrency as "EUR" | "NOK") || "NOK");
      setTxDate(new Date().toISOString().substring(0, 10));
    }
  }, [todoItem]);

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
            className="bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[360px] rounded-3xl p-6 shadow-2xl text-[var(--foreground)]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4">
              <h3 className="font-extrabold text-base">Importa Spesa</h3>
              <Button
                isIconOnly
                variant="ghost"
                className="text-[var(--text-muted)] rounded-lg hover:bg-neutral-500/10 h-7 w-7 border-0 cursor-pointer"
                onPress={onClose}
              >
                <X size={15} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col bg-neutral-500/5 p-3 rounded-xl border border-[var(--card-border)] text-xs gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  Articolo da completare
                </span>
                <span className="font-bold text-[var(--foreground)]">
                  {todoItem.title}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
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
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                    Valuta
                  </span>
                  <CustomSelect
                    value={txCurrency}
                    onChange={(val: string) =>
                      setTxCurrency(val as "EUR" | "NOK")
                    }
                    options={[
                      { value: "NOK", label: "NOK" },
                      { value: "EUR", label: "EUR" },
                    ]}
                  />
                </div>
              </div>

              {txAmount && !Number.isNaN(parseFloat(txAmount)) && (
                <div className="py-2 px-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] text-blue-500 font-bold flex justify-between">
                  <span>Stima convertito:</span>
                  <span>
                    {txCurrency === "EUR" ? (
                      <>
                        {(parseFloat(txAmount) * exchangeRate).toFixed(0)} NOK
                      </>
                    ) : (
                      <>
                        {(parseFloat(txAmount) / exchangeRate).toFixed(2)} EUR
                      </>
                    )}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Data Spesa
                </span>
                <CustomDatePicker
                  value={txDate}
                  onChange={(setDateVal) => setTxDate(setDateVal)}
                />
              </div>

              <Button
                type="submit"
                isDisabled={isSubmitting}
                className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-11 rounded-xl cursor-pointer hover:opacity-90 mt-2 shadow-sm"
              >
                {isSubmitting ? "Importazione..." : "Conferma Spesa & Archivia"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
