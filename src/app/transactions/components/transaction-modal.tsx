"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategoryIcon, CURATED_ICONS } from "@/components/icon-helper";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { MoneyInput } from "@/components/ui/money-input";
import { APPLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; icon: string; color: string };

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (tx: {
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

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1.5">
      <Icon size={11} className="opacity-60" />
      {children}
    </span>
  );
}

export function TransactionModal({
  isOpen,
  onClose,
  categories,
  onSave,
  onCreateCategory,
}: TransactionModalProps) {
  const { convertCurrency, displayCurrency } = useDashboard();
  const [txDesc, setTxDesc] = useState("");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txCurrency, setTxCurrency] = useState<string>(displayCurrency);
  const [txDate, setTxDate] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [txCategoryId, setTxCategoryId] = useState("");

  const [isInlineCatOpen, setIsInlineCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Home");
  const [newCatColor, setNewCatColor] = useState("#007AFF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseFloat(txAmount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  const showConversion = hasAmount && txCurrency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, txCurrency, displayCurrency)
    : null;
  const targetCurrency = displayCurrency;

  const handleCreateCategoryInline = async () => {
    if (!newCatName) return;
    try {
      const cat = await onCreateCategory({
        name: newCatName,
        icon: newCatIcon,
        color: newCatColor,
      });
      setTxCategoryId(cat.id);
      setNewCatName("");
      setIsInlineCatOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTxDesc("");
    setTxAmount("");
    setTxCategoryId("");
    setIsInlineCatOpen(false);
    setNewCatName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || Number.isNaN(parsedAmount) || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSave({
        description: txDesc,
        type: txType,
        amount: parsedAmount,
        currency: txCurrency,
        categoryId: txCategoryId || null,
        date: new Date(txDate).toISOString(),
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[460px] rounded-3xl shadow-2xl text-[var(--foreground)] max-h-[90vh] flex flex-col"
          >
            {}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--card-border)] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-2xl flex items-center justify-center border flex-shrink-0 transition-all duration-300",
                    txType === "expense"
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                  )}
                >
                  {txType === "expense" ? (
                    <TrendingDown size={16} />
                  ) : (
                    <TrendingUp size={16} />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">
                    Registra Transazione
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Nuova spesa o guadagno
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-[var(--text-muted)] rounded-xl hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-y-auto"
            >
              <div className="px-6 pt-5 pb-5 flex flex-col gap-4">
                {}
                <div>
                  <FieldLabel icon={Tag}>Tipo operazione</FieldLabel>
                  <div className="relative flex p-1 bg-neutral-500/5 rounded-xl border border-[var(--card-border)] h-11 overflow-hidden select-none">
                    <div
                      className={cn(
                        "absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg transition-all duration-300 shadow-sm",
                        txType === "expense"
                          ? "left-1 bg-rose-500"
                          : "left-[calc(50%+2px)] bg-emerald-500",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setTxType("expense")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                        txType === "expense"
                          ? "text-white"
                          : "text-[var(--text-muted)]",
                      )}
                    >
                      <TrendingDown size={12} /> Spesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType("income")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                        txType === "income"
                          ? "text-white"
                          : "text-[var(--text-muted)]",
                      )}
                    >
                      <TrendingUp size={12} /> Guadagno
                    </button>
                  </div>
                </div>

                {}
                <div>
                  <FieldLabel icon={Type}>Descrizione</FieldLabel>
                  <div className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center border border-[var(--card-border)] w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                    <input
                      type="text"
                      placeholder="Es. Cena, Stipendio, Affitto, Supermercato..."
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      required
                      className="text-sm text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </div>

                {}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2">
                    <FieldLabel icon={Wallet}>Importo</FieldLabel>
                    <MoneyInput
                      value={txAmount}
                      onChange={setTxAmount}
                      currency={txCurrency}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel icon={ArrowLeftRight}>Valuta</FieldLabel>
                    <CurrencySelect
                      value={txCurrency}
                      onChange={setTxCurrency}
                    />
                  </div>
                </div>

                {}
                {convertedAmount !== null && (
                  <div className="flex items-center justify-between px-3 py-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
                      <ArrowLeftRight size={11} className="text-blue-500" />
                      Conversione stimata
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <span className="text-[var(--text-muted)]">
                        {parsedAmount.toFixed(2)} {txCurrency}
                      </span>
                      <span className="text-neutral-400">→</span>
                      <span className="text-blue-500">
                        {convertedAmount.toFixed(2)} {targetCurrency}
                      </span>
                    </div>
                  </div>
                )}

                {}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel icon={Tag}>Categoria</FieldLabel>
                    <button
                      type="button"
                      className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer border-0 bg-transparent -mt-1.5"
                      onClick={() => setIsInlineCatOpen(!isInlineCatOpen)}
                    >
                      {isInlineCatOpen ? "Indietro" : "Crea nuova"}
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    {isInlineCatOpen ? (
                      <motion.div
                        key="cat-creator"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-3 p-3.5 bg-neutral-500/5 border border-[var(--card-border)] rounded-2xl overflow-hidden"
                      >
                        <div className="bg-[var(--card-solid)] h-10 px-3 rounded-xl flex items-center border border-[var(--card-border)] w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                          <input
                            type="text"
                            placeholder="Nome categoria"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="text-sm text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full placeholder:text-[var(--text-muted)]"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider block mb-1.5">
                            Colore
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {APPLE_COLORS.map((col) => (
                              <button
                                type="button"
                                key={col}
                                className={cn(
                                  "w-5 h-5 rounded-full cursor-pointer transition-all border-2",
                                  newCatColor === col
                                    ? "border-[var(--foreground)] scale-110 shadow"
                                    : "border-transparent",
                                )}
                                style={{ backgroundColor: col }}
                                onClick={() => setNewCatColor(col)}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider block mb-1.5">
                            Icona
                          </span>
                          <div className="flex flex-wrap gap-1.5 bg-[var(--card-solid)] p-2 rounded-xl border border-[var(--card-border)] max-h-[72px] overflow-y-auto">
                            {CURATED_ICONS.map((ico) => (
                              <button
                                type="button"
                                key={ico}
                                className={cn(
                                  "p-1 rounded-lg cursor-pointer transition-all",
                                  newCatIcon === ico
                                    ? "bg-blue-500 text-white"
                                    : "text-[var(--foreground)] hover:bg-neutral-500/10",
                                )}
                                onClick={() => setNewCatIcon(ico)}
                              >
                                <CategoryIcon name={ico} size={14} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="bg-blue-500 text-white text-[10px] font-bold border-0 h-8 rounded-xl cursor-pointer hover:opacity-90 w-full flex items-center justify-center transition-all"
                          onClick={handleCreateCategoryInline}
                        >
                          Crea Categoria
                        </button>
                      </motion.div>
                    ) : (
                      <CategorySelect
                        value={txCategoryId}
                        onChange={setTxCategoryId}
                        categories={categories}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {}
                <div>
                  <FieldLabel icon={CalendarDays}>Data</FieldLabel>
                  <CustomDatePicker value={txDate} onChange={setTxDate} />
                </div>
              </div>

              {}
              <div className="px-6 pb-5 pt-3 border-t border-[var(--card-border)] flex-shrink-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--foreground)] text-[var(--background)] font-bold text-sm h-12 rounded-xl cursor-pointer hover:opacity-90 shadow-sm w-full border-0 disabled:opacity-50 flex items-center justify-center transition-all"
                >
                  {isSubmitting ? "Salvataggio..." : "Salva Transazione"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
