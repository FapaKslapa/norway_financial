"use client";

import { Button, InputGroup } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  CalendarDays,
  Tag,
  Type,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { CategoryIcon } from "../../../components/icon-helper";
import { CustomDatePicker } from "../../../components/ui/custom-datepicker";
import { CustomSelect } from "../../../components/ui/custom-select";
import { MoneyInput } from "../../../components/ui/money-input";
import { cn } from "../../../lib/utils";

type CategoryType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type FriendType = {
  user: {
    id: string;
    name: string;
  };
};

type QuickAddFormProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  friends: FriendType[];
  exchangeRate: number;
  onSave: (transaction: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: "EUR" | "NOK";
    categoryId: string | null;
    date: string;
    sharedWithUserId: string | null;
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
    <span className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1.5">
      <Icon size={10} className="opacity-70" />
      {children}
    </span>
  );
}

export function QuickAddForm({
  isOpen,
  onClose,
  categories,
  friends,
  exchangeRate,
  onSave,
}: QuickAddFormProps) {
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"EUR" | "NOK">("NOK");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [sharedUserId, setSharedUserId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSaving(true);
    try {
      await onSave({
        description: desc,
        type,
        amount: parsedAmount,
        currency,
        categoryId: categoryId || null,
        date: date || new Date().toISOString(),
        sharedWithUserId: sharedUserId || null,
      });
      setDesc("");
      setAmount("");
      setCategoryId("");
      setSharedUserId("");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const parsedAmount = parseFloat(amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const convertedAmount = hasAmount
    ? currency === "EUR"
      ? parsedAmount * exchangeRate
      : parsedAmount / exchangeRate
    : null;
  const targetCurrency = currency === "EUR" ? "NOK" : "EUR";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-[var(--card-solid)] border border-[var(--card-border)] w-full md:max-w-[600px] rounded-t-[2rem] md:rounded-[2rem] p-0 shadow-2xl text-[var(--foreground)] z-10 max-h-[92dvh] md:max-h-[85vh] flex flex-col mx-0 md:mx-4"
          >
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-[var(--card-border)] flex-shrink-0">
              <div className="flex flex-col">
                <h3 className="font-extrabold text-base leading-tight">
                  {type === "expense" ? "Nuova Spesa" : "Nuovo Guadagno"}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Registra rapidamente una transazione
                </p>
              </div>
              <Button
                isIconOnly
                variant="ghost"
                className="text-[var(--text-muted)] rounded-xl hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer flex items-center justify-center flex-shrink-0"
                onPress={onClose}
              >
                <X size={16} />
              </Button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-0 flex-1 overflow-y-auto"
            >
              <div className="px-6 pt-5 pb-6 flex flex-col gap-5">
                <div>
                  <FieldLabel icon={Tag}>Tipo di operazione</FieldLabel>
                  <div className="relative flex p-1 bg-neutral-500/5 rounded-xl border border-[var(--card-border)] h-11 w-full overflow-hidden select-none">
                    <div
                      className={cn(
                        "absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg transition-all duration-300 shadow-sm",
                        type === "expense"
                          ? "left-1 bg-rose-500/90"
                          : "left-[calc(50%+2px)] bg-emerald-500/90",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setType("expense")}
                      className={cn(
                        "flex-1 text-center text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                        type === "expense"
                          ? "text-white"
                          : "text-[var(--foreground)]",
                      )}
                    >
                      💸 Spesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("income")}
                      className={cn(
                        "flex-1 text-center text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                        type === "income"
                          ? "text-white"
                          : "text-[var(--foreground)]",
                      )}
                    >
                      💰 Guadagno
                    </button>
                  </div>
                </div>

                <div>
                  <FieldLabel icon={Type}>Descrizione</FieldLabel>
                  <InputGroup className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-11 px-3 rounded-xl flex items-center border-0 w-full font-sans focus-within:ring-2 focus-within:ring-blue-500/30 transition-all duration-200">
                    <InputGroup.Input
                      type="text"
                      placeholder="Es. Cena fuori, Stipendio, Supermercato..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      required
                      className="text-sm text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal"
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-2">
                    <FieldLabel icon={Wallet}>Importo</FieldLabel>
                    <MoneyInput
                      value={amount}
                      onChange={setAmount}
                      currency={currency}
                      required
                      className="h-12 text-sm"
                      inputClassName="text-base font-black"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel icon={ArrowRightLeft}>Valuta</FieldLabel>
                    <CustomSelect
                      value={currency}
                      onChange={(val: string) =>
                        setCurrency(val as "EUR" | "NOK")
                      }
                      options={[
                        { value: "NOK", label: "🇳🇴 NOK" },
                        { value: "EUR", label: "🇪🇺 EUR" },
                      ]}
                      triggerClassName="h-12"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {convertedAmount !== null && (
                    <motion.div
                      key="conversion"
                      initial={{ opacity: 0, height: 0, marginTop: -16 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: -16 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-blue-500/5 border border-blue-500/10 select-none">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
                          <ArrowRightLeft size={12} className="text-blue-500" />
                          <span>Conversione stimata</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black">
                          <span className="text-[var(--text-muted)]">
                            {parsedAmount.toFixed(currency === "EUR" ? 2 : 0)}{" "}
                            {currency}
                          </span>
                          <span className="text-neutral-400">→</span>
                          <span className="text-blue-500">
                            {convertedAmount.toFixed(
                              targetCurrency === "EUR" ? 2 : 0,
                            )}{" "}
                            {targetCurrency}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel icon={Tag}>Categoria</FieldLabel>
                    <CustomSelect
                      value={categoryId}
                      onChange={setCategoryId}
                      placeholder="Generale (Nessuna)"
                      options={[
                        {
                          value: "",
                          label: "Generale",
                          color: "#8E8E93",
                          icon: <CategoryIcon name="Sparkles" size={13} />,
                        },
                        ...categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                          color: cat.color,
                          icon: <CategoryIcon name={cat.icon} size={13} />,
                        })),
                      ]}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={CalendarDays}>Data</FieldLabel>
                    <CustomDatePicker value={date} onChange={setDate} />
                  </div>
                </div>

                {type === "expense" && friends.length > 0 && (
                  <div>
                    <FieldLabel icon={Users}>Dividi con un amico</FieldLabel>
                    <CustomSelect
                      value={sharedUserId}
                      onChange={setSharedUserId}
                      placeholder="Nessuna condivisione"
                      options={[
                        { value: "", label: "Solo mia" },
                        ...friends.map((f) => ({
                          value: f.user.id,
                          label: f.user.name,
                        })),
                      ]}
                    />
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-[var(--card-border)] flex gap-3 flex-shrink-0 bg-[var(--card-solid)]">
                <Button
                  type="button"
                  variant="ghost"
                  onPress={onClose}
                  className="flex-1 text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 text-xs font-bold rounded-xl h-12 cursor-pointer"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  isDisabled={isSaving}
                  className={cn(
                    "flex-[2] font-bold text-sm h-12 rounded-xl cursor-pointer shadow-sm border-0 transition-all",
                    type === "expense"
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white",
                    isSaving && "opacity-70",
                  )}
                >
                  {isSaving
                    ? "Salvataggio..."
                    : type === "expense"
                      ? "Aggiungi Spesa"
                      : "Aggiungi Guadagno"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
