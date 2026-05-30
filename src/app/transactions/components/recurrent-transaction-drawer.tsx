"use client";

import dayjs from "dayjs";
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
import { useEffect, useState } from "react";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { CustomSelect } from "@/components/ui/custom-select";
import { MoneyInput } from "@/components/ui/money-input";
import { recurrentTransactionSchema } from "@/lib/schemas/recurrent-transaction";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type RecurrentTx = {
  id: string;
  description: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  type: string;
  frequency: string;
  startDate: Date | string;
  endDate: Date | string | null;
  status: string;
};

type RecurrentTransactionDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  editingTx: RecurrentTx | null;
  onSubmitSuccess: () => void;
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

export function RecurrentTransactionDrawer({
  isOpen,
  onClose,
  categories,
  editingTx,
  onSubmitSuccess,
}: RecurrentTransactionDrawerProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const createMutation = trpc.recurrentTransaction.create.useMutation({
    onSuccess: () => {
      onSubmitSuccess();
      onClose();
    },
    onError: (err) => {
      setValidationError(err.message || "Errore nella creazione.");
      setIsSubmitting(false);
    },
  });

  const updateMutation = trpc.recurrentTransaction.update.useMutation({
    onSuccess: () => {
      onSubmitSuccess();
      onClose();
    },
    onError: (err) => {
      setValidationError(err.message || "Errore nell'aggiornamento.");
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (editingTx) {
      setDescription(editingTx.description);
      setAmount(editingTx.amount);
      setCurrency(editingTx.currency);
      setCategoryId(editingTx.categoryId || "");
      setType(editingTx.type as "expense" | "income");
      setFrequency(
        editingTx.frequency as "daily" | "weekly" | "monthly" | "yearly",
      );
      setStartDate(dayjs(editingTx.startDate).format("YYYY-MM-DD"));
      setEndDate(
        editingTx.endDate ? dayjs(editingTx.endDate).format("YYYY-MM-DD") : "",
      );
      setValidationError("");
    } else {
      setDescription("");
      setAmount("");
      setCurrency("EUR");
      setCategoryId("");
      setType("expense");
      setFrequency("monthly");
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate("");
      setValidationError("");
    }
  }, [editingTx]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError("Inserisci un importo valido e maggiore di zero.");
      return;
    }

    const payload = {
      description,
      amount: parsedAmount,
      currency,
      categoryId: categoryId || null,
      type,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status: "active" as const,
    };

    const validation = recurrentTransactionSchema.safeParse(payload);

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Input non valido.";
      setValidationError(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTx) {
        await updateMutation.mutateAsync({
          id: editingTx.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-4">
          <motion.div
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
            className="bg-(--card-solid) border border-(--card-border) w-full md:max-w-[460px] rounded-t-[2rem] md:rounded-3xl shadow-2xl text-foreground max-h-[92dvh] md:max-h-[90vh] flex flex-col"
          >
            <div className="flex md:hidden justify-center pt-3 shrink-0">
              <div className="w-10 h-1 rounded-full bg-(--card-border)" />
            </div>

            <div className="flex items-center justify-between px-6 pt-3 md:pt-5 pb-4 border-b border-(--card-border) shrink-0">
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
                    {editingTx ? "Modifica Regola" : "Nuova Regola Ricorrente"}
                  </h3>
                  <p className="text-[10px] text-(--text-muted)">
                    {editingTx
                      ? "Aggiorna i dettagli della regola ricorrente"
                      : "Imposta una spesa o entrata ripetitiva"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-(--text-muted) rounded-xl hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden md:rounded-b-3xl"
            >
              <div className="flex-1 overflow-y-auto px-6 pt-5 pb-5 flex flex-col gap-4">
                {/* Descrizione */}
                <div>
                  <FieldLabel icon={Type}>Descrizione</FieldLabel>
                  <div className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center border border-(--card-border) w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                    <input
                      type="text"
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
                    <CustomDatePicker
                      value={startDate}
                      onChange={setStartDate}
                    />
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

              <div className="px-6 pb-5 pt-3 border-t border-(--card-border) shrink-0 bg-(--card-solid) flex flex-col gap-3 md:rounded-b-3xl">
                {validationError && (
                  <span className="text-[10px] text-red-500 font-bold self-start">
                    {validationError}
                  </span>
                )}
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    className="flex-1 bg-neutral-500/10 hover:bg-neutral-500/15 text-foreground h-11 rounded-xl text-xs font-black transition-colors border-0 cursor-pointer flex items-center justify-center"
                    onClick={onClose}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-foreground text-background h-11 rounded-xl text-xs font-black transition-all border-0 cursor-pointer flex items-center justify-center disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Salvataggio..."
                      : editingTx
                        ? "Salva Regola"
                        : "Crea Regola"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
