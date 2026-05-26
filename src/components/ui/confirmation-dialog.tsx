"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

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
  title = "Conferma eliminazione",
  message = "Sei sicuro di voler procedere? Questa azione non può essere annullata.",
  confirmLabel = "Elimina",
  cancelLabel = "Annulla",
  isDestructive = true,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-transparent border-0 w-full h-full cursor-default"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[360px] rounded-3xl p-6 shadow-2xl text-[var(--foreground)] z-10 flex flex-col items-center text-center animate-none"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
              <AlertTriangle size={22} />
            </div>

            <h3 className="font-extrabold text-sm mb-2">{title}</h3>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-6">
              {message}
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                className="border border-[var(--card-border)] hover:bg-neutral-500/10 text-xs font-bold h-10 rounded-xl cursor-pointer text-[var(--foreground)] bg-transparent"
                onPress={onClose}
              >
                {cancelLabel}
              </Button>
              <Button
                variant="outline"
                className={
                  isDestructive
                    ? "bg-rose-500 text-white text-xs font-bold border-0 h-10 rounded-xl cursor-pointer hover:opacity-90"
                    : "bg-blue-500 text-white text-xs font-bold border-0 h-10 rounded-xl cursor-pointer hover:opacity-90"
                }
                onPress={handleConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
