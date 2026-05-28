"use client";

import { Button } from "@heroui/react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Edit3,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { CustomSelect } from "@/components/ui/custom-select";
import { MoneyInput } from "@/components/ui/money-input";
import { recurrentTransactionSchema } from "@/lib/schemas/recurrent-transaction";
import { trpc } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";

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
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const updateMutation = trpc.recurrentTransaction.update.useMutation({
    onSuccess: () => {
      listQuery.refetch();
      resetForm();
    },
    onError: (err) => {
      setValidationError(err.message || "Errore nell'aggiornamento.");
    },
  });

  const toggleStatusMutation =
    trpc.recurrentTransaction.toggleStatus.useMutation({
      onSuccess: () => {
        listQuery.refetch();
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
    setEndDate("");
    setEditingId(null);
    setValidationError("");
    setIsFormOpen(false);
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

  const handleEdit = (rt: RecurrentTx) => {
    setEditingId(rt.id);
    setDescription(rt.description);
    setAmount(rt.amount);
    setCurrency(rt.currency);
    setCategoryId(rt.categoryId || "");
    setType(rt.type as "expense" | "income");
    setFrequency(rt.frequency as "daily" | "weekly" | "monthly" | "yearly");
    setStartDate(dayjs(rt.startDate).format("YYYY-MM-DD"));
    setEndDate(rt.endDate ? dayjs(rt.endDate).format("YYYY-MM-DD") : "");
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    await toggleStatusMutation.mutateAsync({ id, status: nextStatus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
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
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-[2rem] p-5 flex flex-col gap-4 overflow-visible"
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
                  Categoria
                </span>
                <CategorySelect
                  value={categoryId}
                  onChange={setCategoryId}
                  categories={categories}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Data inizio
                </span>
                <CustomDatePicker value={startDate} onChange={setStartDate} />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Data fine (Opzionale)
                </span>
                <CustomDatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Nessuna data di fine"
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
            </div>

            {validationError && (
              <span className="text-[10px] text-red-500 font-bold ml-1">
                {validationError}
              </span>
            )}

            <Button
              type="submit"
              className="w-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-extrabold text-xs h-11 rounded-xl cursor-pointer border-0 mt-2"
              isDisabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvataggio..."
                : editingId
                  ? "Salva Modifiche"
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
          <>
            <div className="hidden md:block overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Descrizione</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Stato</th>
                    <th className="pb-3">Importo</th>
                    <th className="pb-3">Frequenza</th>
                    <th className="pb-3">Scadenza</th>
                    <th className="pb-3">Prossima Esecuzione</th>
                    <th className="pb-3 text-right pr-2">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]/50 text-xs">
                  {listQuery.data.map((rt) => {
                    const category = categories.find(
                      (c) => c.id === rt.categoryId,
                    );
                    const isPaused = rt.status === "paused";
                    return (
                      <tr
                        key={rt.id}
                        className={cn(
                          "hover:bg-neutral-500/5 transition-colors",
                          isPaused && "opacity-60",
                        )}
                      >
                        <td className="py-3 pl-2 font-bold flex items-center gap-2">
                          {category ? (
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              <CategoryIcon
                                name={category.icon}
                                size={11}
                                className="text-white"
                              />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-neutral-500/10 text-neutral-500 flex items-center justify-center">
                              <span className="text-[10px]">⏰</span>
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
                        <td className="py-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold capitalize border",
                              isPaused
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20",
                            )}
                          >
                            {isPaused ? "Sospeso" : "Attivo"}
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
                          {rt.endDate
                            ? dayjs(rt.endDate).format("DD/MM/YYYY")
                            : "-"}
                        </td>
                        <td className="py-3 text-[var(--text-muted)] font-medium">
                          <div className="flex items-center gap-1">
                            <Clock size={11} className="opacity-60" />
                            {isPaused ? (
                              <span className="text-amber-500 font-bold">
                                Sospesa
                              </span>
                            ) : (
                              dayjs(rt.nextOccurrence).format("DD/MM/YYYY")
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              isIconOnly
                              variant="ghost"
                              className={cn(
                                "h-8 w-8 rounded-xl cursor-pointer border-0",
                                isPaused
                                  ? "text-emerald-500 hover:bg-emerald-500/10"
                                  : "text-amber-500 hover:bg-amber-500/10",
                              )}
                              onPress={() =>
                                handleToggleStatus(rt.id, rt.status)
                              }
                            >
                              {isPaused ? (
                                <Play size={13} />
                              ) : (
                                <Pause size={13} />
                              )}
                            </Button>
                            <Button
                              isIconOnly
                              variant="ghost"
                              className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-xl cursor-pointer border-0"
                              onPress={() => handleEdit(rt)}
                            >
                              <Edit3 size={13} />
                            </Button>
                            <Button
                              isIconOnly
                              variant="ghost"
                              className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-0"
                              onPress={() =>
                                deleteMutation.mutate({ id: rt.id })
                              }
                              isDisabled={deleteMutation.isPending}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="block md:hidden flex flex-col gap-4">
              {listQuery.data.map((rt) => {
                const category = categories.find((c) => c.id === rt.categoryId);
                const isPaused = rt.status === "paused";
                return (
                  <div
                    key={rt.id}
                    className={cn(
                      "p-4 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)]/60 flex flex-col gap-3.5 transition-all select-none",
                      isPaused && "opacity-60",
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        {category ? (
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          >
                            <CategoryIcon
                              name={category.icon}
                              size={12}
                              className="text-white"
                            />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-neutral-500/10 text-neutral-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">⏰</span>
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-black text-[var(--foreground)]">
                            {rt.description}
                          </h4>
                          <span className="text-[9px] text-[var(--text-muted)] uppercase font-mono tracking-wider block">
                            {rt.frequency === "daily" && "Giornaliero"}
                            {rt.frequency === "weekly" && "Settimanale"}
                            {rt.frequency === "monthly" && "Mensile"}
                            {rt.frequency === "yearly" && "Annuale"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs font-black text-[var(--foreground)]">
                          {formatCurrency(parseFloat(rt.amount), rt.currency)}
                        </span>
                        <div className="flex gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold capitalize border ${
                              rt.type === "income"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {rt.type === "income" ? "Entrata" : "Spesa"}
                          </span>
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded-full text-[8px] font-bold capitalize border",
                              isPaused
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20",
                            )}
                          >
                            {isPaused ? "Sospeso" : "Attivo"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] bg-neutral-500/5 dark:bg-zinc-800/20 p-2.5 rounded-xl border border-[var(--card-border)]/40 font-medium">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                          Fine Regola
                        </span>
                        <span>
                          {rt.endDate
                            ? dayjs(rt.endDate).format("DD/MM/YYYY")
                            : "Senza Scadenza"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 items-end">
                        <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                          Prossimo Addebito
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="opacity-60" />
                          <span>
                            {isPaused
                              ? "Sospesa"
                              : dayjs(rt.nextOccurrence).format("DD/MM/YYYY")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-[var(--card-border)]/40 pt-2.5">
                      <Button
                        variant="ghost"
                        className={cn(
                          "h-8 text-[10px] font-bold rounded-xl px-3 border-0 bg-transparent flex items-center gap-1.5 cursor-pointer",
                          isPaused
                            ? "text-emerald-500 hover:bg-emerald-500/10"
                            : "text-amber-500 hover:bg-amber-500/10",
                        )}
                        onPress={() => handleToggleStatus(rt.id, rt.status)}
                      >
                        {isPaused ? (
                          <>
                            <Play size={11} /> Attiva
                          </>
                        ) : (
                          <>
                            <Pause size={11} /> Sospendi
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 text-[10px] font-bold text-blue-500 hover:bg-blue-500/10 rounded-xl px-3 border-0 bg-transparent flex items-center gap-1.5 cursor-pointer"
                        onPress={() => handleEdit(rt)}
                      >
                        <Edit3 size={11} /> Modifica
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl px-3 border-0 bg-transparent flex items-center gap-1.5 cursor-pointer"
                        onPress={() => deleteMutation.mutate({ id: rt.id })}
                        isDisabled={deleteMutation.isPending}
                      >
                        <Trash2 size={11} /> Elimina
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
