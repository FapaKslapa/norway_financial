"use client";

import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";

type AmountConversionProps = {
  amount: string | number;
  currency: "EUR" | "NOK";
  exchangeRate: number;
};

export function AmountConversion({
  amount,
  currency,
  exchangeRate,
}: AmountConversionProps) {
  const parsed = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  const isEur = currency === "EUR";
  const converted = isEur ? parsed * exchangeRate : parsed / exchangeRate;
  const targetCurrency = isEur ? "NOK" : "EUR";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-3 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)] select-none"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
        <ArrowRightLeft size={13} className="text-blue-500 animate-pulse" />
        <span>Valore stimato:</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-black text-[var(--foreground)]">
        <span className="text-[var(--text-muted)] font-bold">
          {parsed.toFixed(isEur ? 2 : 0)} {currency}
        </span>
        <span className="text-neutral-400 font-bold">→</span>
        <span className="text-blue-500">
          {converted.toFixed(isEur ? 0 : 2)} {targetCurrency}
        </span>
      </div>
    </motion.div>
  );
}
