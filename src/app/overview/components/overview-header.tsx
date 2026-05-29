"use client";

import { Button } from "@heroui/react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";

type OverviewHeaderProps = {
  userName: string;
  onOpenQuickAdd: () => void;
};

export function OverviewHeader({
  userName,
  onOpenQuickAdd,
}: OverviewHeaderProps) {
  return (
    <div className="flex justify-between items-end flex-wrap gap-4 select-none">
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
          Benvenuto, {userName || "Studente"}
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Panoramica Mensile
        </h2>
        <p className="text-(--text-muted) text-xs">
          Mese corrente:{" "}
          <span className="font-bold text-foreground capitalize">
            {dayjs().format("MMMM YYYY")}
          </span>
        </p>
      </div>

      <Button
        variant="outline"
        className="font-bold text-xs bg-blue-500 text-white border-0 hover:opacity-90 rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-sm"
        onPress={onOpenQuickAdd}
      >
        <Plus size={14} /> Spesa Rapida
      </Button>
    </div>
  );
}
