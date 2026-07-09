"use client";

import { Check } from "lucide-react";
import type React from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { APPLE_COLORS, CURATED_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FormAction } from "./category-types";

type CategoryFormPanelProps = {
  editingId: string | null;
  newCatName: string;
  newCatIcon: string;
  newCatColor: string;
  isSubmitting: boolean;
  dispatch: React.Dispatch<FormAction>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancelEdit: () => void;
};

export function CategoryFormPanel({
  editingId,
  newCatName,
  newCatIcon,
  newCatColor,
  isSubmitting,
  dispatch,
  onSubmit,
  onCancelEdit,
}: CategoryFormPanelProps) {
  return (
    <>
      <div className="flex justify-between items-center shrink-0">
        <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
          {editingId ? "Modifica Categoria" : "Crea Nuova Categoria"}
        </h4>
        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-[10px] font-black text-blue-500 hover:underline border-0 cursor-pointer bg-transparent"
          >
            Annulla modifica
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
              Nome Categoria
            </span>
            <input
              type="text"
              aria-label="Nome categoria"
              placeholder="Es. Spesa, Svago, Bollette..."
              value={newCatName}
              onChange={(e) =>
                dispatch({ type: "SET_NAME", val: e.target.value })
              }
              required
              className="h-11 px-3 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-(--card-border) outline-none text-xs font-bold text-foreground placeholder:text-(--text-muted) focus-within:ring-2 focus-within:ring-blue-500/20"
            />
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
              Icona Categoria
            </span>
            <div className="grid grid-cols-5 gap-2 max-h-[120px] overflow-y-auto pr-1 p-2 bg-neutral-500/5 rounded-xl border border-(--card-border)/40">
              {CURATED_ICONS.map((ico) => {
                const isSelected = newCatIcon === ico;
                return (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => dispatch({ type: "SET_ICON", val: ico })}
                    aria-label={`Seleziona icona ${ico}`}
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer hover:scale-105 active:scale-95",
                      isSelected
                        ? "bg-foreground text-background border-transparent shadow-sm"
                        : "bg-transparent text-foreground border-transparent hover:bg-neutral-500/10",
                    )}
                  >
                    <CategoryIcon name={ico} size={13} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
              Colore Categoria
            </span>
            <div className="flex flex-wrap gap-2 p-2 bg-neutral-500/5 rounded-xl border border-(--card-border)/40 max-h-[90px] overflow-y-auto">
              {APPLE_COLORS.map((col) => {
                const isSelected = newCatColor === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => dispatch({ type: "SET_COLOR", val: col })}
                    aria-label={`Seleziona colore ${col}`}
                    className="h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shrink-0"
                    style={{ backgroundColor: col }}
                  >
                    {isSelected && (
                      <Check
                        size={12}
                        className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-black"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-foreground text-background font-black text-xs h-11 rounded-xl cursor-pointer hover:opacity-90 mt-1 shadow-sm border-0 disabled:opacity-50 flex items-center justify-center transition-all w-full"
          >
            {isSubmitting
              ? editingId
                ? "Salvataggio..."
                : "Aggiunta..."
              : editingId
                ? "Salva Modifiche"
                : "Aggiungi Categoria"}
          </button>
        </form>
      </div>
    </>
  );
}
