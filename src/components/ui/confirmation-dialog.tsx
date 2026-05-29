"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Conferma operazione",
  message = "Sei sicuro di voler procedere? Questa azione non può essere annullata.",
  confirmLabel = "Procedi",
  cancelLabel = "Annulla",
  isDestructive = true,
}: ConfirmationDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={isPending ? undefined : onClose}
          />

          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-(--card-solid) border border-(--card-border) w-full max-w-[350px] rounded-[2rem] p-6 shadow-2xl text-foreground z-10 flex flex-col items-center text-center overflow-hidden"
          >
            {}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
                isDestructive
                  ? "bg-rose-500/10 text-rose-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {isDestructive ? (
                <AlertTriangle size={20} />
              ) : (
                <HelpCircle size={20} />
              )}
            </div>

            <h3 className="font-extrabold text-sm tracking-tight mb-2 px-1 text-foreground">
              {title}
            </h3>

            <p className="text-[10px] text-(--text-muted) leading-relaxed mb-6 px-2 font-medium">
              {message}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                disabled={isPending}
                className="border border-(--card-border) hover:bg-neutral-500/10 text-xs font-bold h-10 rounded-xl cursor-pointer text-foreground bg-transparent transition-all flex items-center justify-center disabled:opacity-50"
                onClick={onClose}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={isPending}
                className={`text-xs font-bold h-10 rounded-xl cursor-pointer hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-white disabled:opacity-50 ${
                  isDestructive
                    ? "bg-rose-500 hover:bg-rose-600 shadow-sm"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-sm"
                }`}
                onClick={handleConfirm}
              >
                {isPending && <Loader2 size={12} className="animate-spin" />}
                {isPending ? "Attendi..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
