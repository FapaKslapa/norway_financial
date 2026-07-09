"use client";

import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { AnimatePresence, m } from "framer-motion";
import { TrendingDown, TrendingUp, X } from "lucide-react";
import { useReducer, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { recurrentTransactionSchema } from "@/lib/schemas/recurrent-transaction";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { RecurrentFormFields } from "./recurrent-form-fields";

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

type FormState = {
  description: string;
  amount: string;
  currency: string;
  categoryId: string;
  type: "expense" | "income";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
  validationError: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<FormState> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

type RecurrentTransactionFormProps = {
  editingTx: RecurrentTx | null;
  categories: CategoryOption[];
  onClose: () => void;
  onSubmitSuccess: () => void;
  isMobile: boolean;
};

function RecurrentTransactionForm({
  editingTx,
  categories,
  onClose,
  onSubmitSuccess,
  isMobile,
}: RecurrentTransactionFormProps) {
  const [state, dispatch] = useReducer(formReducer, null, () => {
    if (editingTx) {
      return {
        description: editingTx.description,
        amount: editingTx.amount,
        currency: editingTx.currency,
        categoryId: editingTx.categoryId || "",
        type: editingTx.type as "expense" | "income",
        frequency: editingTx.frequency as "daily" | "weekly" | "monthly" | "yearly",
        startDate: dayjs(editingTx.startDate).format("YYYY-MM-DD"),
        endDate: editingTx.endDate ? dayjs(editingTx.endDate).format("YYYY-MM-DD") : "",
        validationError: "",
        isSubmitting: false,
      };
    }
    return {
      description: "",
      amount: "",
      currency: "EUR",
      categoryId: "",
      type: "expense" as const,
      frequency: "monthly" as const,
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: "",
      validationError: "",
      isSubmitting: false,
    };
  });

  const {
    description,
    amount,
    currency,
    categoryId,
    type,
    frequency,
    startDate,
    endDate,
    validationError,
    isSubmitting,
  } = state;

  const trpc = useTRPC();
  const createMutation = useMutation(
    trpc.recurrentTransaction.create.mutationOptions({
      onSuccess: () => {
        onSubmitSuccess();
        onClose();
      },
      onError: (err) => {
        dispatch({ type: "SET_FIELD", field: "validationError", value: err.message || "Errore nella creazione." });
        dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.recurrentTransaction.update.mutationOptions({
      onSuccess: () => {
        onSubmitSuccess();
        onClose();
      },
      onError: (err) => {
        dispatch({ type: "SET_FIELD", field: "validationError", value: err.message || "Errore nell'aggiornamento." });
        dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
      },
    }),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      dispatch({ type: "SET_FIELD", field: "validationError", value: "Inserisci un importo valido e maggiore di zero." });
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
      dispatch({ type: "SET_FIELD", field: "validationError", value: firstError });
      return;
    }

    dispatch({ type: "SET_FIELD", field: "isSubmitting", value: true });
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
      dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
    }
  };

  return (
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
            aria-label="Chiudi"
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
          <RecurrentFormFields
            description={description}
            setDescription={(val) => dispatch({ type: "SET_FIELD", field: "description", value: val })}
            amount={amount}
            setAmount={(val) => dispatch({ type: "SET_FIELD", field: "amount", value: val })}
            currency={currency}
            setCurrency={(val) => dispatch({ type: "SET_FIELD", field: "currency", value: val })}
            categoryId={categoryId}
            setCategoryId={(val) => dispatch({ type: "SET_FIELD", field: "categoryId", value: val })}
            type={type}
            setType={(val) => dispatch({ type: "SET_FIELD", field: "type", value: val })}
            frequency={frequency}
            setFrequency={(val) => dispatch({ type: "SET_FIELD", field: "frequency", value: val })}
            startDate={startDate}
            setStartDate={(val) => dispatch({ type: "SET_FIELD", field: "startDate", value: val })}
            endDate={endDate}
            setEndDate={(val) => dispatch({ type: "SET_FIELD", field: "endDate", value: val })}
            categories={categories}
          />

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
      </m.div>
    </div>
  );
}

export function RecurrentTransactionDrawer({
  isOpen,
  onClose,
  categories,
  editingTx,
  onSubmitSuccess,
}: RecurrentTransactionDrawerProps) {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isOpen && (
        <RecurrentTransactionForm
          editingTx={editingTx}
          categories={categories}
          onClose={onClose}
          onSubmitSuccess={onSubmitSuccess}
          isMobile={isMobile}
        />
      )}
    </AnimatePresence>
  );
}
