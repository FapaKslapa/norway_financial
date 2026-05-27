"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type React from "react";

type NewListModalProps = {
  isOpen: boolean;
  name: string;
  onChangeName: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function NewListModal({
  isOpen,
  name,
  onChangeName,
  onClose,
  onSubmit,
}: NewListModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[340px] rounded-3xl p-6 shadow-2xl text-[var(--foreground)]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4">
              <h3 className="font-extrabold text-base">Crea Nuova Lista</h3>
              <button
                type="button"
                className="text-[var(--text-muted)] rounded-lg hover:bg-neutral-500/10 h-7 w-7 border-0 cursor-pointer bg-transparent flex items-center justify-center transition-all"
                onClick={onClose}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                  Nome Lista
                </span>
                <div className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-11 px-3 rounded-xl flex items-center border border-[var(--card-border)] w-full focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 transition-all duration-300">
                  <input
                    type="text"
                    placeholder="es. Regali di Natale, Spesa Rema"
                    value={name}
                    onChange={(e) => onChangeName(e.target.value)}
                    required
                    className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-11 rounded-xl cursor-pointer hover:opacity-90 mt-2 shadow-sm border-0 w-full"
              >
                Crea Lista
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
