"use client";

import { AnimatePresence, m } from "framer-motion";
import { TrendingDown, TrendingUp, X } from "lucide-react";
import type React from "react";
import { useReducer } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import {
  AmountCurrencyRow,
  CategorySection,
  ConversionBadge,
  DateField,
  DescriptionField,
  SubmitButton,
  TransactionTypeToggle,
} from "./transaction-modal-fields";
import { todayISO, useTransactionForm } from "./use-transaction-form";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Category = { id: string; name: string; icon: string; color: string };

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editingTx?: {
    id: string;
    description: string | null;
    type: "expense" | "income";
    amount: string;
    currency: string;
    categoryId: string | null;
    date: string | Date;
  } | null;
  onSave: (tx: {
    id?: string;
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => Promise<void>;
  onCreateCategory: (cat: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<{ id: string }>;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TransactionModal({
  isOpen,
  onClose,
  categories,
  editingTx,
  onSave,
  onCreateCategory,
}: TransactionModalProps) {
  const { convertCurrency, displayCurrency } = useDashboard();
  const isMobile = useIsMobile();
  const { form, set, reset } = useTransactionForm(displayCurrency);

  // Sync editingTx → form when the prop changes (derived-state-on-render)
  const [prevTx, dispatchPrev] = useReducer(
    (_: typeof editingTx, next: typeof editingTx) => next,
    editingTx,
  );
  if (editingTx !== prevTx) {
    dispatchPrev(editingTx);
    if (editingTx) {
      const parsedDate = new Date(editingTx.date);
      set({
        txDesc: editingTx.description ?? "",
        txType: editingTx.type,
        txAmount: parseFloat(editingTx.amount).toString(),
        txCurrency: editingTx.currency,
        txDate: !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString().substring(0, 10)
          : todayISO(),
        txCategoryId: editingTx.categoryId ?? "",
      });
    } else {
      reset();
    }
  }

  // Derived
  const parsedAmount = parseFloat(form.txAmount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const showConversion = hasAmount && form.txCurrency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, form.txCurrency, displayCurrency)
    : null;

  // Handlers
  const handleCreateCategoryInline = async () => {
    if (!form.newCatName) return;
    try {
      const cat = await onCreateCategory({
        name: form.newCatName,
        icon: form.newCatIcon,
        color: form.newCatColor,
      });
      set({ txCategoryId: cat.id, newCatName: "", isInlineCatOpen: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.txAmount || Number.isNaN(parsedAmount) || form.isSubmitting)
      return;
    set({ isSubmitting: true });
    try {
      await onSave({
        id: editingTx?.id,
        description: form.txDesc,
        type: form.txType,
        amount: parsedAmount,
        currency: form.txCurrency,
        categoryId: form.txCategoryId || null,
        date: new Date(form.txDate).toISOString(),
      });
      reset();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      set({ isSubmitting: false });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4">
          <m.div
            initial={
              isMobile ? { y: "100%" } : { opacity: 0, scale: 0.97, y: 16 }
            }
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.97, y: 16 }}
            transition={
              isMobile
                ? { duration: 0.35, ease: [0.32, 0.72, 0, 1] }
                : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (isMobile && (info.offset.y > 120 || info.velocity.y > 500))
                onClose();
            }}
            className="bg-(--card-solid) border border-(--card-border) w-full md:max-w-[460px] rounded-t-[2rem] md:rounded-3xl shadow-2xl text-foreground max-h-[92dvh] md:max-h-[90vh] flex flex-col"
          >
            {/* Drag handle (mobile only) */}
            <div className="flex md:hidden justify-center pt-3 shrink-0">
              <div className="w-10 h-1 rounded-full bg-(--card-border)" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-3 md:pt-5 pb-4 border-b border-(--card-border) shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300",
                    form.txType === "expense"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                  )}
                >
                  {form.txType === "expense" ? (
                    <TrendingDown size={16} />
                  ) : (
                    <TrendingUp size={16} />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">
                    {editingTx
                      ? "Modifica Transazione"
                      : "Registra Transazione"}
                  </h3>
                  <p className="text-[10px] text-(--text-muted)">
                    {editingTx
                      ? "Modifica i dettagli della transazione"
                      : "Nuova spesa o guadagno"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Chiudi"
                className="text-(--text-muted) rounded-xl hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden md:rounded-b-3xl"
            >
              <div className="flex-1 overflow-y-auto px-6 pt-5 pb-5 flex flex-col gap-4">
                <TransactionTypeToggle
                  value={form.txType}
                  onChange={(v) => set({ txType: v })}
                />
                <DescriptionField
                  value={form.txDesc}
                  onChange={(v) => set({ txDesc: v })}
                />
                <AmountCurrencyRow
                  amount={form.txAmount}
                  currency={form.txCurrency}
                  onAmountChange={(v) => set({ txAmount: v })}
                  onCurrencyChange={(v) => set({ txCurrency: v })}
                />
                {convertedAmount !== null && (
                  <ConversionBadge
                    parsedAmount={parsedAmount}
                    convertedAmount={convertedAmount}
                    sourceCurrency={form.txCurrency}
                    targetCurrency={displayCurrency}
                  />
                )}
                <CategorySection
                  categoryId={form.txCategoryId}
                  categories={categories}
                  onCategoryChange={(v) => set({ txCategoryId: v })}
                  isInlineCatOpen={form.isInlineCatOpen}
                  onToggleInlineCat={() =>
                    set({ isInlineCatOpen: !form.isInlineCatOpen })
                  }
                  newCatName={form.newCatName}
                  onNewCatNameChange={(v) => set({ newCatName: v })}
                  newCatColor={form.newCatColor}
                  onNewCatColorChange={(v) => set({ newCatColor: v })}
                  newCatIcon={form.newCatIcon}
                  onNewCatIconChange={(v) => set({ newCatIcon: v })}
                  onCreateCategory={handleCreateCategoryInline}
                />
                <DateField
                  value={form.txDate}
                  onChange={(v) => set({ txDate: v })}
                />
              </div>
              <SubmitButton isSubmitting={form.isSubmitting} />
            </form>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
