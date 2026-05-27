"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Trash2, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { CategoryIcon, CURATED_ICONS } from "@/components/icon-helper";
import { APPLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type CategoriesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onDeleteCategory: (id: string) => void;
  onCreateCategory: (cat: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<void>;
};

export function CategoriesModal({
  isOpen,
  onClose,
  categories,
  onDeleteCategory,
  onCreateCategory,
}: CategoriesModalProps) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Home");
  const [newCatColor, setNewCatColor] = useState("#007AFF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
      });
      setNewCatName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[400px] rounded-3xl p-6 shadow-2xl text-[var(--foreground)] flex flex-col max-h-[75vh]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 flex-shrink-0">
              <h3 className="font-extrabold text-base">Le mie Categorie</h3>
              <button
                type="button"
                className="text-[var(--text-muted)] rounded-lg hover:bg-neutral-500/10 h-7 w-7 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)] select-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-xl text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={14} />
                    </div>
                    <span className="text-xs font-bold">{cat.name}</span>
                  </div>

                  <button
                    type="button"
                    className="text-rose-500 hover:bg-rose-500/15 rounded-lg h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                    onClick={() => onDeleteCategory(cat.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--card-border)] pt-4 mt-4 flex-shrink-0">
              <h4 className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-2">
                Crea Nuova Categoria
              </h4>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <div className="bg-neutral-500/5 dark:bg-zinc-800/30 h-9 px-2.5 rounded-xl flex items-center border border-[var(--card-border)] w-full focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
                    <input
                      type="text"
                      placeholder="Nome categoria..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                      className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                    Icona
                  </span>
                  <div className="grid grid-cols-6 gap-1 max-h-20 overflow-y-auto pr-1">
                    {CURATED_ICONS.map((ico) => {
                      const isSelected = newCatIcon === ico;
                      return (
                        <button
                          key={ico}
                          type="button"
                          onClick={() => setNewCatIcon(ico)}
                          className={cn(
                            "h-7 w-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer",
                            isSelected
                              ? "bg-[var(--foreground)] text-[var(--background)] border-transparent"
                              : "bg-neutral-500/5 text-[var(--foreground)] border-[var(--card-border)] hover:bg-neutral-500/10",
                          )}
                        >
                          <CategoryIcon name={ico} size={12} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                    Colore
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto w-full">
                    {APPLE_COLORS.map((col) => {
                      const isSelected = newCatColor === col;
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewCatColor(col)}
                          className="h-5 w-5 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 flex-shrink-0"
                          style={{ backgroundColor: col }}
                        >
                          {isSelected && (
                            <Check
                              size={10}
                              className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-bold"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-9 rounded-xl cursor-pointer hover:opacity-90 mt-1 shadow-sm border-0 disabled:opacity-50 flex items-center justify-center transition-all w-full"
                >
                  {isSubmitting ? "Aggiunta..." : "Aggiungi Categoria"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
