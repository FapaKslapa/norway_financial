"use client";

import { AnimatePresence, m } from "framer-motion";
import { BarChart3, Globe, Settings, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";

type OnboardingCardProps = {
  showOnboarding: boolean;
  onDismiss: () => void;
};

export function OnboardingCard({
  showOnboarding,
  onDismiss,
}: OnboardingCardProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {showOnboarding && (
        <m.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)",
          }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-20 translate-x-20 pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full bg-white/5 translate-y-12 pointer-events-none" />

          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-2 right-2 h-10 w-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 cursor-pointer bg-transparent border-0 transition-all z-30"
            aria-label="Chiudi onboarding"
          >
            <X size={15} />
          </button>

          <div className="relative z-10 p-6 pb-5">
            <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center mb-4 text-white">
              <Globe size={22} />
            </div>

            <h2 className="text-base font-black text-white mb-1 tracking-tight">
              Benvenuto in Gravio
            </h2>
            <p className="text-xs text-white/65 leading-relaxed max-w-md">
              Tieni traccia delle tue spese in qualsiasi valuta con tassi di
              cambio in tempo reale. Inizia configurando la tua valuta e il
              budget mensile.
            </p>

            <div className="flex items-center gap-3 mt-5">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <BarChart3 size={13} className="text-white/70" />
                <span className="text-[10px] font-bold text-white">
                  Analytics
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <Globe size={13} className="text-white/70" />
                <span className="text-[10px] font-bold text-white">
                  Multi-valuta
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <ShieldCheck size={13} className="text-white/70" />
                <span className="text-[10px] font-bold text-white">Budget</span>
              </div>
            </div>

            <m.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/settings?tab=general")}
              className="mt-5 flex items-center gap-2 bg-white text-blue-600 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer border-0 shadow-lg shadow-black/10 transition-all"
            >
              <Settings size={12} />
              Configura ora
            </m.button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
