"use client";

import { Button } from "@heroui/react";
import dayjs from "dayjs";
import { Clock, Edit3, Pause, Play, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { cn, formatCurrency } from "@/lib/utils";

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
  nextOccurrence?: Date | string | null;
};

type RecurrentTransactionCardProps = {
  rt: RecurrentTx;
  category?: CategoryOption;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (rt: RecurrentTx) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
};

export function RecurrentTransactionCard({
  rt,
  category,
  onToggleStatus,
  onEdit,
  onDelete,
  isDeletePending,
}: RecurrentTransactionCardProps) {
  const isPaused = rt.status === "paused";

  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-neutral-500/5 border border-(--card-border)/60 flex flex-col gap-3.5 transition-all select-none",
        isPaused && "opacity-60",
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5">
          {category ? (
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: category.color }}
            >
              <CategoryIcon
                name={category.icon}
                size={12}
                className="text-white"
              />
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: "#8E8E93" }}
            >
              <CategoryIcon name="Sparkles" size={12} className="text-white" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-black text-foreground">
              {rt.description}
            </h4>
            <span className="text-[9px] text-(--text-muted) uppercase font-mono tracking-wider block">
              {rt.frequency === "daily" && "Giornaliero"}
              {rt.frequency === "weekly" && "Settimanale"}
              {rt.frequency === "monthly" && "Mensile"}
              {rt.frequency === "yearly" && "Annuale"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs font-black text-foreground">
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

      <div className="flex items-center justify-between text-[10px] bg-neutral-500/5 dark:bg-zinc-800/20 p-2.5 rounded-xl border border-(--card-border)/40 font-medium">
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] text-(--text-muted) font-black uppercase tracking-wider">
            Fine Regola
          </span>
          <span>
            {rt.endDate
              ? dayjs(rt.endDate).format("DD/MM/YYYY")
              : "Senza Scadenza"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-[8px] text-(--text-muted) font-black uppercase tracking-wider">
            Prossimo Addebito
          </span>
          <div className="flex items-center gap-1">
            <Clock size={10} className="opacity-60" />
            <span>
              {isPaused
                ? "Sospesa"
                : rt.nextOccurrence
                  ? dayjs(rt.nextOccurrence).format("DD/MM/YYYY")
                  : "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-(--card-border)/40 pt-2.5">
        <Button
          variant="ghost"
          className={cn(
            "h-8 text-[10px] font-bold rounded-xl px-3 border-0 bg-transparent flex items-center gap-1.5 cursor-pointer",
            isPaused
              ? "text-emerald-500 hover:bg-emerald-500/10"
              : "text-amber-500 hover:bg-amber-500/10",
          )}
          onPress={() => onToggleStatus(rt.id, rt.status)}
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
          onPress={() => onEdit(rt)}
        >
          <Edit3 size={11} /> Modifica
        </Button>
        <Button
          variant="ghost"
          className="h-8 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl px-3 border-0 bg-transparent flex items-center gap-1.5 cursor-pointer"
          onPress={() => onDelete(rt.id)}
          isDisabled={isDeletePending}
        >
          <Trash2 size={11} /> Elimina
        </Button>
      </div>
    </div>
  );
}
