"use client";

import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type AmountConversionProps = {
  amount: string | number;
  fromCurrency: string;
  toCurrency: string;
  convertFn: (amount: number, from: string, to: string) => number;
};

export function AmountConversion({
  amount,
  fromCurrency,
  toCurrency,
  convertFn,
}: AmountConversionProps) {
  const parsed = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(parsed) || parsed <= 0 || fromCurrency === toCurrency) {
    return null;
  }

  const converted = convertFn(parsed, fromCurrency, toCurrency);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-3 rounded-2xl bg-neutral-500/5 border border-(--card-border) select-none"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-(--text-muted)">
        <ArrowRightLeft size={13} className="text-blue-500 animate-pulse" />
        <span>Valore stimato:</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
        <span className="text-(--text-muted) font-bold">
          {formatCurrency(parsed, fromCurrency)}
        </span>
        <span className="text-neutral-400 font-bold">→</span>
        <span className="text-blue-500">
          {formatCurrency(converted, toCurrency)}
        </span>
      </div>
    </motion.div>
  );
}
