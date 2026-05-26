"use client";

import { Button, InputGroup } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { CategoryIcon, CURATED_ICONS } from "../../../components/icon-helper";
import { CustomDatePicker } from "../../../components/ui/custom-datepicker";
import { CustomSelect } from "../../../components/ui/custom-select";
import { MoneyInput } from "../../../components/ui/money-input";
import { APPLE_COLORS } from "../../../lib/constants";
import { cn } from "../../../lib/utils";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Friend = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  friends: Friend[];
  exchangeRate: number;
  onSave: (tx: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: "EUR" | "NOK";
    categoryId: string | null;
    date: string;
    sharedWithUserId: string | null;
  }) => Promise<void>;
  onCreateCategory: (cat: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<{ id: string }>;
};

export function TransactionModal({
  isOpen,
  onClose,
  categories,
  friends,
  exchangeRate,
  onSave,
  onCreateCategory,
}: TransactionModalProps) {
  const [txDesc, setTxDesc] = useState("");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txCurrency, setTxCurrency] = useState<"EUR" | "NOK">("NOK");
  const [txDate, setTxDate] = useState(
    new Date().toISOString().substring(0, 10),
  );
  const [txCategoryId, setTxCategoryId] = useState("");
  const [sharedWithUserId, setSharedWithUserId] = useState("");

  const [isInlineCatCreatorOpen, setIsInlineCatCreatorOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Home");
  const [newCatColor, setNewCatColor] = useState("#007AFF");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setIsInlineCatCreatorOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || Number.isNaN(parseFloat(txAmount)) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        description: txDesc,
        type: txType,
        amount: parseFloat(txAmount),
        currency: txCurrency,
        categoryId: txCategoryId || null,
        date: new Date(txDate).toISOString(),
        sharedWithUserId: sharedWithUserId || null,
      });

      setTxDesc("");
      setTxAmount("");
      setTxCategoryId("");
      setSharedWithUserId("");
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
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[400px] rounded-3xl p-6 shadow-2xl text-[var(--foreground)]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4">
              <h3 className="font-extrabold text-base">Registra Transazione</h3>
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
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Descrizione
                </span>
                <InputGroup className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-11 px-3 rounded-xl flex items-center border-0 w-full font-sans focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 transition-all duration-300">
                  <InputGroup.Input
                    type="text"
                    placeholder="Spesa, Stipendio, Affitto, Cibo..."
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    required
                    className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full"
                  />
                </InputGroup>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Tipo
                </span>
                <div className="relative flex p-1 bg-neutral-500/5 rounded-xl border border-[var(--card-border)] h-10 w-full overflow-hidden select-none">
                  <div
                    className={cn(
                      "absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg bg-[var(--foreground)] text-[var(--background)] transition-all duration-300 shadow",
                      txType === "income" ? "left-[calc(50%+2px)]" : "left-1",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setTxType("expense")}
                    className={cn(
                      "flex-1 text-center text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                      txType === "expense"
                        ? "text-[var(--background)]"
                        : "text-[var(--foreground)]",
                    )}
                  >
                    Spesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType("income")}
                    className={cn(
                      "flex-1 text-center text-xs font-bold z-10 transition-colors cursor-pointer border-0 bg-transparent",
                      txType === "income"
                        ? "text-[var(--background)]"
                        : "text-[var(--foreground)]",
                    )}
                  >
                    Guadagno
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                    Importo
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
                  <span>Valore stimato convertito:</span>
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

              <div className="flex flex-col gap-1.5 relative">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                    Categoria
                  </span>
                  <button
                    type="button"
                    className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer border-0 bg-transparent outline-none"
                    onClick={() =>
                      setIsInlineCatCreatorOpen(!isInlineCatCreatorOpen)
                    }
                  >
                    {isInlineCatCreatorOpen ? "Indietro" : "Crea Nuova..."}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {isInlineCatCreatorOpen ? (
                    <motion.div
                      key="inline-creator"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-3 p-3 bg-neutral-500/10 dark:bg-zinc-800/20 rounded-xl"
                    >
                      <InputGroup className="bg-[var(--card-solid)] h-9 px-2.5 rounded-xl flex items-center border-0 w-full font-sans focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 transition-all duration-300">
                        <InputGroup.Input
                          type="text"
                          placeholder="Nome categoria"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full"
                        />
                      </InputGroup>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase ml-1">
                          Colore
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {APPLE_COLORS.map((col) => (
                            <button
                              type="button"
                              key={col}
                              className={`w-5 h-5 rounded-full cursor-pointer transition-all border-2 ${
                                newCatColor === col
                                  ? "border-[var(--foreground)] scale-110 shadow"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: col }}
                              onClick={() => setNewCatColor(col)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase ml-1">
                          Icona
                        </span>
                        <div className="flex flex-wrap gap-1.5 bg-[var(--card-solid)] p-2 rounded-lg border border-[var(--card-border)] max-h-20 overflow-y-auto w-full">
                          {CURATED_ICONS.map((ico) => (
                            <button
                              type="button"
                              key={ico}
                              className={`p-1 rounded-lg cursor-pointer hover:bg-neutral-500/10 transition-all ${
                                newCatIcon === ico
                                  ? "bg-blue-500 text-white"
                                  : "text-[var(--foreground)]"
                              }`}
                              onClick={() => setNewCatIcon(ico)}
                            >
                              <CategoryIcon name={ico} size={14} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="bg-blue-500 text-white text-[10px] font-bold border-0 h-8 rounded-lg cursor-pointer hover:opacity-90 w-full"
                        onPress={handleCreateCategoryInline}
                      >
                        Crea Categoria
                      </Button>
                    </motion.div>
                  ) : (
                    <CustomSelect
                      value={txCategoryId}
                      onChange={setTxCategoryId}
                      placeholder="Generale (Nessuna)"
                      options={[
                        {
                          value: "",
                          label: "Generale (Nessuna)",
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
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Data
                </span>
                <CustomDatePicker
                  value={txDate}
                  onChange={(setDateVal) => setTxDate(setDateVal)}
                />
              </div>

              {txType === "expense" && friends.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                    Spesa Condivisa
                  </span>
                  <CustomSelect
                    value={sharedWithUserId}
                    onChange={setSharedWithUserId}
                    placeholder="Nessuna condivisione"
                    options={[
                      { value: "", label: "Nessuna condivisione" },
                      ...friends.map((f) => ({
                        value: f.user.id,
                        label: f.user.name,
                      })),
                    ]}
                  />
                </div>
              )}

              <Button
                type="submit"
                isDisabled={isSubmitting}
                className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-11 rounded-xl cursor-pointer hover:opacity-90 mt-2 shadow-sm"
              >
                {isSubmitting ? "Salvataggio..." : "Salva Transazione"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
