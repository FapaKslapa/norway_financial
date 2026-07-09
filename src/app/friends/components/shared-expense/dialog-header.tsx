"use client";

import { ChevronRight, SplitSquareHorizontal, X } from "lucide-react";

type DialogHeaderProps = {
  step: "form" | "split";
  shareType: "friend" | "group";
  selectedGroupName?: string;
  selectedFriendName?: string;
  onBack: () => void;
  onClose: () => void;
};

export function DialogHeader({
  step,
  shareType,
  selectedGroupName,
  selectedFriendName,
  onBack,
  onClose,
}: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-(--card-border) shrink-0">
      <div className="flex items-center gap-3">
        {step === "split" && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Torna indietro"
            className="h-7 w-7 rounded-xl flex items-center justify-center text-(--text-muted) hover:bg-neutral-500/10 cursor-pointer border-0 bg-transparent transition-all"
          >
            <ChevronRight size={14} className="rotate-180" />
          </button>
        )}
        <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
          <SplitSquareHorizontal size={15} />
        </div>
        <div>
          <h3 className="font-extrabold text-sm leading-tight">
            {step === "form" ? "Spesa Condivisa" : "Divisione spesa"}
          </h3>
          <p className="text-[10px] text-(--text-muted)">
            {step === "form"
              ? "Aggiungi una spesa condivisa"
              : shareType === "group"
                ? `Gruppo: ${selectedGroupName}`
                : selectedFriendName
                  ? `con ${selectedFriendName}`
                  : "Scegli modalità"}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Chiudi"
        className="h-7 w-7 text-(--text-muted) rounded-xl hover:bg-neutral-500/10 border-0 cursor-pointer flex items-center justify-center bg-transparent transition-all"
        onClick={onClose}
      >
        <X size={15} />
      </button>
    </div>
  );
}
