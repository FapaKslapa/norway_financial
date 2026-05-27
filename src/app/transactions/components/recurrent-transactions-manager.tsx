"use client";

import { Button } from "@heroui/react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { MoneyInput } from "@/components/ui/money-input";
import { recurrentTransactionSchema } from "@/lib/schemas/recurrent-transaction";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type RecurrentTransactionsManagerProps = {
  categories: CategoryOption[];
};

export function RecurrentTransactionsManager({
  categories,
}: RecurrentTransactionsManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [frequency, setFrequency] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [validationError, setValidationError] = useState("");

  const listQuery = trpc.recurrentTransaction.list.useQuery();

  const createMutation = trpc.recurrentTransaction.create.useMutation({
    onSuccess: () => {
      listQuery.refetch();
      resetForm();
    },
    onError: (err) => {
      setValidationError(err.message || "Errore nella creazione.");
    },
  });

  const deleteMutation = trpc.recurrentTransaction.delete.useMutation({
    onSuccess: () => {
      listQuery.refetch();
    },
  });

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCurrency("EUR");
    setCategoryId("");
    setType("expense");
    setFrequency("monthly");
    setStartDate(dayjs().format("YYYY-MM-DD"));
    setValidationError("");
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError("Inserisci un importo valido e maggiore di zero.");
      return;
    }

    const validation = recurrentTransactionSchema.safeParse({
      description,
      amount: parsedAmount,
      currency,
      categoryId: categoryId || null,
      type,
      frequency,
      startDate: new Date(startDate),
    });

    if (!validation.success) {
      const firstError =
        validation.error.issues[0]?.message || "Input non valido.";
      setValidationError(firstError);
      return;
    }

    await createMutation.mutateAsync({
      description,
      amount: parsedAmount,
      currency,
      categoryId: categoryId || null,
      type,
      frequency,
      startDate: new Date(startDate),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-[var(--foreground)]">
            Pianificatore Ricorrenti
          </h3>
          <p className="text-[10px] text-[var(--text-muted)]">
            Gestisci le tue entrate e spese ripetute nel tempo
          </p>
        </div>
        <Button
          variant="outline"
          className="h-8 text-[10px] font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-0 rounded-xl px-3 flex items-center gap-1.5 cursor-pointer transition-all"
          onPress={() => setIsFormOpen(!isFormOpen)}
        >
          <Plus size={12} />
          {isFormOpen ? "Annulla" : "Nuova Ricorrente"}
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-[2rem] p-5 flex flex-col gap-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Descrizione
                </span>
                <input
                  type="text"
                  required
                  placeholder="Es. Stipendio, Affitto, Netflix..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 px-3 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-[var(--card-border)] outline-none text-xs font-bold text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus-within:ring-2 focus-within:ring-blue-500/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Frequenza
                </span>
                <select
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as typeof frequency)
                  }
                  className="h-11 px-3 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-[var(--card-border)] outline-none text-xs font-bold text-[var(--foreground)]"
                >
                  <option value="daily">Giornaliero</option>
                  <option value="weekly">Settimanale</option>
                  <option value="monthly">Mensile</option>
                  <option value="yearly">Annuale</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Tipo transazione
                </span>
                <div className="flex p-1 bg-neutral-500/5 rounded-xl border border-[var(--card-border)] h-11 overflow-hidden select-none">
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`flex-1 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                      type === "expense"
                        ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                        : "text-[var(--text-muted)] bg-transparent hover:bg-neutral-500/10"
                    }`}
                  >
                    Spesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`flex-1 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                      type === "income"
                        ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                        : "text-[var(--text-muted)] bg-transparent hover:bg-neutral-500/10"
                    }`}
                  >
                    Entrata
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Data inizio
                </span>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 px-3 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-[var(--card-border)] outline-none text-xs font-bold text-[var(--foreground)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Importo
                </span>
                <MoneyInput
                  value={amount}
                  onChange={setAmount}
                  currency={currency}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Valuta
                </span>
                <CurrencySelect value={currency} onChange={setCurrency} />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Categoria
                </span>
                <CategorySelect
                  value={categoryId}
                  onChange={setCategoryId}
                  categories={categories}
                />
              </div>
            </div>

            {validationError && (
              <span className="text-[10px] text-red-500 font-bold ml-1">
                {validationError}
              </span>
            )}

            <Button
              type="submit"
              className="w-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-extrabold text-xs h-11 rounded-xl cursor-pointer border-0 mt-2"
              isDisabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? "Salvataggio..."
                : "Salva Regola Ricorrente"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[2rem] p-5 shadow-sm">
        {listQuery.isLoading ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-xs font-bold">
            Caricamento pianificatore...
          </div>
        ) : listQuery.data && listQuery.data.length > 0 ? (
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Descrizione</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Importo</th>
                  <th className="pb-3">Frequenza</th>
                  <th className="pb-3">Data Inizio</th>
                  <th className="pb-3">Prossima Esecuzione</th>
                  <th className="pb-3 text-right pr-2">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]/50 text-xs">
                {listQuery.data.map((rt) => {
                  const category = categories.find(
                    (c) => c.id === rt.categoryId,
                  );
                  return (
                    <tr
                      key={rt.id}
                      className="hover:bg-neutral-500/5 transition-colors"
                    >
                      <td className="py-3 pl-2 font-bold flex items-center gap-2">
                        {category ? (
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                            style={{ backgroundColor: category.color }}
                          >
                            <span>{category.icon || "📂"}</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-neutral-500/10 text-neutral-500 flex items-center justify-center text-[10px]">
                            <span>⏰</span>
                          </div>
                        )}
                        <span>{rt.description}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                            rt.type === "income"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {rt.type === "income" ? "Entrata" : "Spesa"}
                        </span>
                      </td>
                      <td className="py-3 font-black text-[var(--foreground)]">
                        {formatCurrency(parseFloat(rt.amount), rt.currency)}
                      </td>
                      <td className="py-3 font-bold text-[var(--text-muted)] capitalize">
                        {rt.frequency === "daily" && "Giornaliero"}
                        {rt.frequency === "weekly" && "Settimanale"}
                        {rt.frequency === "monthly" && "Mensile"}
                        {rt.frequency === "yearly" && "Annuale"}
                      </td>
                      <td className="py-3 text-[var(--text-muted)] font-medium">
                        {dayjs(rt.startDate).format("DD/MM/YYYY")}
                      </td>
                      <td className="py-3 text-[var(--text-muted)] font-medium">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="opacity-60" />
                          {dayjs(rt.nextOccurrence).format("DD/MM/YYYY")}
                        </div>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <Button
                          isIconOnly
                          variant="ghost"
                          className="h-8 w-8 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-0"
                          onPress={() => deleteMutation.mutate({ id: rt.id })}
                          isDisabled={deleteMutation.isPending}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--text-muted)]">
            <CalendarDays size={24} className="mb-2 opacity-40" />
            <span className="text-[11px] font-bold">
              Nessuna regola ricorrente attiva
            </span>
            <p className="text-[9px] opacity-75 max-w-[200px] mt-1">
              Crea una regola per automatizzare l'inserimento di stipendi,
              abbonamenti o affitto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
