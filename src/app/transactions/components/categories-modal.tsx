"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Edit2, Trash2, X } from "lucide-react";
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
  onUpdateCategory: (cat: {
    id: string;
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
  onUpdateCategory,
}: CategoriesModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Home");
  const [newCatColor, setNewCatColor] = useState("#007AFF");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdateCategory({
          id: editingId,
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
        });
        setEditingId(null);
      } else {
        await onCreateCategory({
          name: newCatName.trim(),
          icon: newCatIcon,
          color: newCatColor,
        });
      }
      setNewCatName("");
      setNewCatIcon("Home");
      setNewCatColor("#007AFF");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[760px] rounded-[2.5rem] p-8 shadow-2xl text-[var(--foreground)] flex flex-col max-h-[90vh] md:max-h-[620px] overflow-hidden"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)] flex-shrink-0">
              <div>
                <h3 className="font-black text-base tracking-tight">
                  Gestione Categorie
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Crea, modifica ed elimina le categorie delle tue transazioni
                </p>
              </div>
              <button
                type="button"
                className="text-[var(--text-muted)] rounded-full hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6 mt-6 overflow-y-auto pr-1">
              <div className="flex-1 flex flex-col gap-3 min-w-[280px]">
                <h4 className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                  Categorie Esistenti ({categories.length})
                </h4>
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[300px] md:max-h-[400px]">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)]/50 select-none hover:bg-neutral-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-xl text-white shadow-sm flex-shrink-0 w-8 h-8 flex items-center justify-center"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={13} />
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)]">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="text-blue-500 hover:bg-blue-500/10 rounded-xl h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                          onClick={() => {
                            setEditingId(cat.id);
                            setNewCatName(cat.name);
                            setNewCatIcon(cat.icon);
                            setNewCatColor(cat.color);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 w-8 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                          onClick={() => onDeleteCategory(cat.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-[1px] bg-[var(--card-border)]/50 hidden md:block shrink-0" />

              <div className="flex-1 flex flex-col gap-4 min-w-[280px]">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                    {editingId ? "Modifica Categoria" : "Crea Nuova Categoria"}
                  </h4>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setNewCatName("");
                        setNewCatIcon("Home");
                        setNewCatColor("#007AFF");
                      }}
                      className="text-[10px] font-black text-blue-500 hover:underline border-0 cursor-pointer bg-transparent"
                    >
                      Annulla modifica
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                      Nome Categoria
                    </span>
                    <input
                      type="text"
                      placeholder="Es. Spesa, Svago, Bollette..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                      className="h-11 px-3 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-[var(--card-border)] outline-none text-xs font-bold text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus-within:ring-2 focus-within:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                      Icona Categoria
                    </span>
                    <div className="grid grid-cols-5 gap-2 max-h-[120px] overflow-y-auto pr-1 p-2 bg-neutral-500/5 rounded-xl border border-[var(--card-border)]/40">
                      {CURATED_ICONS.map((ico) => {
                        const isSelected = newCatIcon === ico;
                        return (
                          <button
                            key={ico}
                            type="button"
                            onClick={() => setNewCatIcon(ico)}
                            className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer hover:scale-105 active:scale-95",
                              isSelected
                                ? "bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-sm"
                                : "bg-transparent text-[var(--foreground)] border-transparent hover:bg-neutral-500/10",
                            )}
                          >
                            <CategoryIcon name={ico} size={13} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                      Colore Categoria
                    </span>
                    <div className="flex flex-wrap gap-2 p-2 bg-neutral-500/5 rounded-xl border border-[var(--card-border)]/40 max-h-[90px] overflow-y-auto">
                      {APPLE_COLORS.map((col) => {
                        const isSelected = newCatColor === col;
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setNewCatColor(col)}
                            className="h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 flex-shrink-0"
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--foreground)] text-[var(--background)] font-black text-xs h-11 rounded-xl cursor-pointer hover:opacity-90 mt-1 shadow-sm border-0 disabled:opacity-50 flex items-center justify-center transition-all w-full"
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
