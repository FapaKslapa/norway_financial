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

type RecurrentTransactionRowProps = {
  rt: RecurrentTx;
  category?: CategoryOption;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (rt: RecurrentTx) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
};

export function RecurrentTransactionRow({
  rt,
  category,
  onToggleStatus,
  onEdit,
  onDelete,
  isDeletePending,
}: RecurrentTransactionRowProps) {
  const isPaused = rt.status === "paused";

  return (
    <tr
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
      <td className="py-3 font-black text-foreground">
        {formatCurrency(parseFloat(rt.amount), rt.currency)}
      </td>
      <td className="py-3 font-bold text-(--text-muted) capitalize">
        {rt.frequency === "daily" && "Giornaliero"}
        {rt.frequency === "weekly" && "Settimanale"}
        {rt.frequency === "monthly" && "Mensile"}
        {rt.frequency === "yearly" && "Annuale"}
      </td>
      <td className="py-3 text-(--text-muted) font-medium">
        {rt.endDate ? dayjs(rt.endDate).format("DD/MM/YYYY") : "-"}
      </td>
      <td className="py-3 text-(--text-muted) font-medium">
        <div className="flex items-center gap-1">
          <Clock size={11} className="opacity-60" />
          {isPaused ? (
            <span className="text-amber-500 font-bold">Sospesa</span>
          ) : rt.nextOccurrence ? (
            dayjs(rt.nextOccurrence).format("DD/MM/YYYY")
          ) : (
            "-"
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
            onPress={() => onToggleStatus(rt.id, rt.status)}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
          </Button>
          <Button
            isIconOnly
            variant="ghost"
            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-xl cursor-pointer border-0"
            onPress={() => onEdit(rt)}
          >
            <Edit3 size={13} />
          </Button>
          <Button
            isIconOnly
            variant="ghost"
            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-0"
            onPress={() => onDelete(rt.id)}
            isDisabled={isDeletePending}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
