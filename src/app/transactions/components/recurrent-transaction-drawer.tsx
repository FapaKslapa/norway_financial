"use client";

import {
  Button,
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerDialog,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { CustomSelect } from "@/components/ui/custom-select";
import { MoneyInput } from "@/components/ui/money-input";
import { recurrentTransactionSchema } from "@/lib/schemas/recurrent-transaction";
import { trpc } from "@/lib/trpc/client";

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

  const createMutation = trpc.recurrentTransaction.create.useMutation({
    onSuccess: () => {
      onSubmitSuccess();
      onClose();
    },
    onError: (err) => {
      setValidationError(err.message || "Errore nella creazione.");
    },
  });

  const updateMutation = trpc.recurrentTransaction.update.useMutation({
    onSuccess: () => {
      onSubmitSuccess();
      onClose();
    },
    onError: (err) => {
      setValidationError(err.message || "Errore nell'aggiornamento.");
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

    if (editingTx) {
      await updateMutation.mutateAsync({
        id: editingTx.id,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerBackdrop variant="blur">
        <DrawerContent
          placement="right"
          className="bg-(--card-solid) border-l border-(--card-border) text-foreground w-full max-w-md h-full"
        >
          <DrawerDialog>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <DrawerCloseTrigger
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-neutral-500/10 text-(--text-muted)"
                aria-label="Close"
              >
                <X size={16} />
              </DrawerCloseTrigger>
              <DrawerHeader className="flex flex-col gap-1 border-b border-(--card-border) p-5 shrink-0">
                <h3 className="text-sm font-black">
                  {editingTx
                    ? "Modifica Regola Ricorrente"
                    : "Nuova Regola Ricorrente"}
                </h3>
                <p className="text-[10px] text-(--text-muted) font-medium">
                  {editingTx
                    ? "Aggiorna i dettagli della transazione ricorrente"
                    : "Crea una nuova regola per entrate o spese ripetitive"}
                </p>
              </DrawerHeader>

              <DrawerBody className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                      Descrizione
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Es. Stipendio, Affitto, Netflix..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-11 px-3 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-(--card-border) outline-none text-xs font-bold text-foreground placeholder:text-(--text-muted) focus-within:ring-2 focus-within:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
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
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                      Tipo transazione
                    </span>
                    <div className="flex p-1 bg-neutral-500/5 rounded-xl border border-(--card-border) h-11 overflow-hidden select-none">
                      <button
                        type="button"
                        onClick={() => setType("expense")}
                        className={`flex-1 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                          type === "expense"
                            ? "bg-foreground text-background shadow-sm"
                            : "text-(--text-muted) bg-transparent hover:bg-neutral-500/10"
                        }`}
                      >
                        Spesa
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("income")}
                        className={`flex-1 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                          type === "income"
                            ? "bg-foreground text-background shadow-sm"
                            : "text-(--text-muted) bg-transparent hover:bg-neutral-500/10"
                        }`}
                      >
                        Entrata
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                      Categoria
                    </span>
                    <CategorySelect
                      value={categoryId}
                      onChange={setCategoryId}
                      categories={categories}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                      Data inizio
                    </span>
                    <CustomDatePicker
                      value={startDate}
                      onChange={setStartDate}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                      Data fine (Opzionale)
                    </span>
                    <CustomDatePicker
                      value={endDate}
                      onChange={setEndDate}
                      placeholder="Nessuna data di fine"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                      Importo
                    </span>
                    <MoneyInput
                      value={amount}
                      onChange={setAmount}
                      currency={currency}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
                      Valuta
                    </span>
                    <CurrencySelect value={currency} onChange={setCurrency} />
                  </div>
                </div>
              </DrawerBody>

              <DrawerFooter className="border-t border-(--card-border) p-5 flex flex-col gap-2 shrink-0">
                {validationError && (
                  <span className="text-[10px] text-red-500 font-bold self-start mb-1">
                    {validationError}
                  </span>
                )}
                <div className="flex gap-3 w-full">
                  <Button
                    variant="ghost"
                    className="flex-1 bg-neutral-500/10 text-foreground h-11 rounded-xl text-xs font-bold border-0 cursor-pointer flex items-center justify-center"
                    onPress={onClose}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-foreground text-background h-11 rounded-xl text-xs font-bold border-0 cursor-pointer flex items-center justify-center"
                    isDisabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Salvataggio..."
                      : editingTx
                        ? "Salva"
                        : "Crea"}
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </DrawerDialog>
        </DrawerContent>
      </DrawerBackdrop>
    </Drawer>
  );
}
