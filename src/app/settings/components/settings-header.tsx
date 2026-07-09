"use client";

import { m } from "framer-motion";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

type SettingsHeaderProps = {
  onSave: () => void;
  isSaving: boolean;
};

export function SettingsHeader({ onSave, isSaving }: SettingsHeaderProps) {
  const router = useRouter();

  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-between gap-4 select-none"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Torna indietro"
          className="h-9 w-9 rounded-full border border-(--card-border) flex items-center justify-center text-(--text-muted) hover:text-foreground hover:bg-neutral-500/10 cursor-pointer bg-(--card-solid) transition-all shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider hidden md:block">
            Account
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">
            Impostazioni
          </h2>
        </div>
      </div>

      <m.button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="bg-foreground text-background hover:opacity-90 text-xs font-black rounded-2xl h-10 px-5 cursor-pointer flex items-center gap-2 border-0 disabled:opacity-50 transition-opacity shadow-sm shrink-0"
      >
        {isSaving ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Save size={13} />
        )}
        <span className="hidden sm:inline">Salva Impostazioni</span>
        <span className="sm:hidden">Salva</span>
      </m.button>
    </m.div>
  );
}
