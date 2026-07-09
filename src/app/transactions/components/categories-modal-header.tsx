"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormAction } from "./category-types";

type CategoriesModalHeaderProps = {
  categoriesCount: number;
  editingId: string | null;
  mobilePanel: "list" | "form";
  dispatch: React.Dispatch<FormAction>;
  onClose: () => void;
};

export function CategoriesModalHeader({
  categoriesCount,
  editingId,
  mobilePanel,
  dispatch,
  onClose,
}: CategoriesModalHeaderProps) {
  return (
    <>
      {/* Title row */}
      <div className="flex justify-between items-center px-6 md:px-8 pt-5 md:pt-8 pb-4 border-b border-(--card-border) shrink-0">
        <div>
          <h3 className="font-black text-base tracking-tight">
            Gestione Categorie
          </h3>
          <p className="text-[10px] text-(--text-muted) mt-0.5">
            Crea, modifica ed elimina le categorie delle tue transazioni
          </p>
        </div>
        <button
          type="button"
          aria-label="Chiudi"
          className="text-(--text-muted) rounded-full hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all shrink-0"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Mobile tab switcher */}
      <div className="flex md:hidden gap-1 mx-6 mt-4 p-1 bg-neutral-100 dark:bg-zinc-800/30 rounded-2xl border border-(--card-border)/40 shrink-0">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_MOBILE_PANEL", val: "list" })}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all border-0 cursor-pointer",
            mobilePanel === "list"
              ? "bg-foreground text-background shadow-sm"
              : "text-(--text-muted) bg-transparent",
          )}
        >
          Categorie ({categoriesCount})
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_MOBILE_PANEL", val: "form" })}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-xl transition-all border-0 cursor-pointer",
            mobilePanel === "form"
              ? "bg-foreground text-background shadow-sm"
              : "text-(--text-muted) bg-transparent",
          )}
        >
          {editingId ? "Modifica" : "Nuova"}
        </button>
      </div>
    </>
  );
}
