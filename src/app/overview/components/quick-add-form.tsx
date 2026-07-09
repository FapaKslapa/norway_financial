"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, m } from "framer-motion";
import {
  ArrowLeftRight,
  CalendarDays,
  Tag,
  TrendingDown,
  TrendingUp,
  Type,
  Wallet,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useReducer, useRef, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { MoneyInput } from "@/components/ui/money-input";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type CategoryType = { id: string; name: string; icon: string; color: string };

type QuickAddFormProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  onSave: (transaction: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => Promise<void>;
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

type FormState = {
  desc: string;
  type: "expense" | "income";
  amount: string;
  currency: string;
  categoryId: string;
  date: string;
  isSaving: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "RESET"; payload: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

export function QuickAddForm({
  isOpen,
  onClose,
  categories,
  onSave,
}: QuickAddFormProps) {
  const { convertCurrency, displayCurrency } = useDashboard();
  const isMobile = useIsMobile();

  const [state, dispatch] = useReducer(formReducer, null, () => ({
    desc: "",
    type: "expense" as const,
    amount: "",
    currency: displayCurrency,
    categoryId: "",
    date: "",
    isSaving: false,
  }));

  const { desc, type, amount, currency, categoryId, date, isSaving } = state;

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const parsedAmount = parseFloat(amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  const showConversion = hasAmount && currency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, currency, displayCurrency)
    : null;
  const targetCurrency = displayCurrency;

  const handleSave = async () => {
    if (!desc.trim() || !hasAmount) return;
    dispatch({ type: "SET_FIELD", field: "isSaving", value: true });
    try {
      await onSave({
        description: desc.trim(),
        type,
        amount: parsedAmount,
        currency,
        categoryId: categoryId || null,
        date: date || new Date().toISOString(),
      });
      dispatch({
        type: "RESET",
        payload: {
          desc: "",
          type: "expense",
          amount: "",
          currency: displayCurrency,
          categoryId: "",
          date: "",
          isSaving: false,
        },
      });
      onClose();
    } finally {
      dispatch({ type: "SET_FIELD", field: "isSaving", value: false });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
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
              if (isMobile && (info.offset.y > 120 || info.velocity.y > 500)) {
                onClose();
              }
            }}
            className="relative bg-(--card-solid) border border-(--card-border) w-full md:max-w-[520px] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl text-foreground z-10 max-h-[92dvh] md:max-h-[85vh] flex flex-col mx-0 md:mx-4 overflow-hidden"
          >
            <div className="flex md:hidden justify-center pt-3 shrink-0">
              <div className="w-10 h-1 rounded-full bg-(--card-border)" />
            </div>

            <div className="flex items-center justify-between px-6 pt-3 md:pt-6 pb-4 border-b border-(--card-border) shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-2xl flex items-center justify-center border shrink-0 transition-all duration-300",
                    type === "expense"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                  )}
                >
                  {type === "expense" ? (
                    <TrendingDown size={16} />
                  ) : (
                    <TrendingUp size={16} />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">
                    {type === "expense" ? "Nuova Spesa" : "Nuovo Guadagno"}
                  </h3>
                  <p className="text-[10px] text-(--text-muted)">
                    Registra rapidamente una transazione
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                variant="ghost"
                className="text-(--text-muted) rounded-xl hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer flex items-center justify-center shrink-0"
                onPress={onClose}
              >
                <X size={16} />
              </Button>
            </div>

            <QuickAddFields
              type={type}
              setType={(val) => dispatch({ type: "SET_FIELD", field: "type", value: val })}
              desc={desc}
              setDesc={(val) => dispatch({ type: "SET_FIELD", field: "desc", value: val })}
              amount={amount}
              setAmount={(val) => dispatch({ type: "SET_FIELD", field: "amount", value: val })}
              currency={currency}
              setCurrency={(val) => dispatch({ type: "SET_FIELD", field: "currency", value: val })}
              categoryId={categoryId}
              setCategoryId={(val) => dispatch({ type: "SET_FIELD", field: "categoryId", value: val })}
              date={date}
              setDate={(val) => dispatch({ type: "SET_FIELD", field: "date", value: val })}
              categories={categories}
              convertedAmount={convertedAmount}
              targetCurrency={targetCurrency}
              displayCurrency={displayCurrency}
            />

            <QuickAddFooter
              type={type}
              isSaving={isSaving}
              canSave={hasAmount && !!desc.trim()}
              onCancel={onClose}
              onSave={handleSave}
            />
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type QuickAddFieldsProps = {
  type: "expense" | "income";
  setType: (type: "expense" | "income") => void;
  desc: string;
  setDesc: (desc: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  categoryId: string;
  setCategoryId: (categoryId: string) => void;
  date: string;
  setDate: (date: string) => void;
  categories: CategoryType[];
  convertedAmount: number | null;
  targetCurrency: string;
  displayCurrency: string;
};

function QuickAddFields({
  type,
  setType,
  desc,
  setDesc,
  amount,
  setAmount,
  currency,
  setCurrency,
  categoryId,
  setCategoryId,
  date,
  setDate,
  categories,
  convertedAmount,
  targetCurrency,
  displayCurrency,
}: QuickAddFieldsProps) {
  const parsedAmount = parseFloat(amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="px-6 pt-5 pb-5 flex flex-col gap-5">
        <div>
          <FieldLabel icon={Tag}>Tipo operazione</FieldLabel>
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
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                type === "expense" ? "text-white" : "text-(--text-muted)",
              )}
            >
              <TrendingDown size={12} /> Spesa
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                type === "income" ? "text-white" : "text-(--text-muted)",
              )}
            >
              <TrendingUp size={12} /> Guadagno
            </button>
          </div>
        </div>

        <div>
          <FieldLabel icon={Type}>Descrizione</FieldLabel>
          <div className="bg-neutral-500/5 dark:bg-zinc-800/30 h-11 px-3 rounded-xl flex items-center border border-(--card-border) focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
            <input
              type="text"
              aria-label="Descrizione transazione"
              placeholder="Es. Cena fuori, Stipendio, Supermercato..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="text-xs text-foreground flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-(--text-muted)"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FieldLabel icon={Wallet}>Importo</FieldLabel>
            <MoneyInput
              value={amount}
              onChange={setAmount}
              currency={currency}
              className="h-11"
              inputClassName="text-sm font-black"
            />
            {/* Presets */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mt-1.5 scrollbar-none select-none">
              {[1, 5, 10, 20, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    const current = parseFloat(amount) || 0;
                    setAmount((current + num).toFixed(2));
                  }}
                  className="text-[9px] font-black px-2.5 py-1.5 rounded-lg bg-neutral-500/5 dark:bg-zinc-800/20 hover:bg-neutral-500/10 dark:hover:bg-zinc-800/40 text-foreground border border-(--card-border)/40 cursor-pointer transition-colors shrink-0"
                >
                  +{num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  setAmount("");
                }}
                className="text-[9px] font-black px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 cursor-pointer transition-colors ml-auto shrink-0"
              >
                Clear
              </button>
            </div>
          </div>
          <div>
            <FieldLabel icon={ArrowLeftRight}>Valuta</FieldLabel>
            <CurrencySelect value={currency} onChange={setCurrency} />
          </div>
        </div>

        <AnimatePresence>
          {convertedAmount !== null && (
            <m.div
              key="conv"
              initial={{ opacity: 0, height: 0, marginTop: -16 }}
              animate={{ opacity: 1, height: "auto", marginTop: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: -16 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-(--text-muted)">
                  <ArrowLeftRight size={11} className="text-blue-500" />
                  Conversione stimata
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <span className="text-(--text-muted)">
                    {parsedAmount.toFixed(2)} {currency}
                  </span>
                  <span className="text-neutral-400">→</span>
                  <span className="text-blue-500">
                    {convertedAmount.toFixed(2)} {targetCurrency}
                  </span>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <FieldLabel icon={Tag}>Categoria</FieldLabel>
            <CategorySelect
              value={categoryId}
              onChange={setCategoryId}
              categories={categories}
            />
            {/* Quick Categories */}
            {categories.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1 mt-1.5 scrollbar-none select-none">
                {categories.slice(0, 4).map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        setCategoryId(isSelected ? "" : cat.id);
                      }}
                      style={{
                        backgroundColor: isSelected ? cat.color : undefined,
                        color: isSelected ? "#ffffff" : undefined,
                      }}
                      className={cn(
                        "text-[9px] font-black px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all flex items-center gap-1 shrink-0",
                        isSelected
                          ? "border-transparent"
                          : "bg-neutral-500/5 dark:bg-zinc-800/20 hover:bg-neutral-500/10 dark:hover:bg-zinc-800/40 text-foreground border-(--card-border)/40",
                      )}
                    >
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <FieldLabel icon={CalendarDays}>Data</FieldLabel>
            <CustomDatePicker value={date} onChange={setDate} />
          </div>
        </div>
      </div>
    </div>
  );
}

type QuickAddFooterProps = {
  type: "expense" | "income";
  isSaving: boolean;
  canSave: boolean;
  onCancel: () => void;
  onSave: () => void;
};

function QuickAddFooter({
  type,
  isSaving,
  canSave,
  onCancel,
  onSave,
}: QuickAddFooterProps) {
  return (
    <div className="px-6 pb-6 pt-3 border-t border-(--card-border) flex gap-3 shrink-0 bg-(--card-solid)">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-12 text-xs font-bold text-foreground border border-(--card-border) hover:bg-neutral-500/10 rounded-xl cursor-pointer bg-transparent transition-colors"
      >
        Annulla
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving || !canSave}
        className={cn(
          "flex-[2] h-12 text-sm font-bold rounded-xl cursor-pointer shadow-sm border-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          type === "expense"
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-emerald-500 hover:bg-emerald-600 text-white",
        )}
      >
        {isSaving
          ? "Salvataggio..."
          : type === "expense"
            ? "Aggiungi Spesa"
            : "Aggiungi Guadagno"}
      </button>
    </div>
  );
}
