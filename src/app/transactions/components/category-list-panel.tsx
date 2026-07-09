"use client";

import { Edit2, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import type { Category, FormAction } from "./category-types";

type CategoryListPanelProps = {
  categories: Category[];
  dispatch: React.Dispatch<FormAction>;
  onDeleteCategory: (id: string) => void;
};

export function CategoryListPanel({
  categories,
  dispatch,
  onDeleteCategory,
}: CategoryListPanelProps) {
  return (
    <>
      <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider ml-1 shrink-0">
        Categorie Esistenti ({categories.length})
      </h4>
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-(--card-border)/50 select-none hover:bg-neutral-500/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl text-white shadow-sm shrink-0 w-8 h-8 flex items-center justify-center"
                style={{ backgroundColor: cat.color }}
              >
                <CategoryIcon name={cat.icon} size={13} />
              </div>
              <span className="text-xs font-bold text-foreground">
                {cat.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {cat.userId && (
                <>
                  <button
                    type="button"
                    aria-label="Modifica categoria"
                    className="text-blue-500 hover:bg-blue-500/10 rounded-xl h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                    onClick={() => dispatch({ type: "START_EDIT", cat })}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Elimina categoria"
                    className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                    onClick={() => onDeleteCategory(cat.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
