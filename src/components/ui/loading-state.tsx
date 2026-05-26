"use client";

import { motion } from "framer-motion";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 w-full select-none">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 border-3 border-blue-500/25 border-t-blue-500 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0.3, scale: 0.95 }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute h-4 w-4 bg-blue-500 rounded-full"
        />
      </div>
      <p className="text-xs font-bold text-[var(--text-muted)] tracking-wide">
        Caricamento in corso...
      </p>
    </div>
  );
}
