"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn, formatCurrency } from "../../../lib/utils";

type MonthTrend = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

type SavingsTrendCardProps = {
  trendData: MonthTrend[];
  displayCurrency: "NOK" | "EUR";
};

export function SavingsTrendCard({
  trendData,
  displayCurrency,
}: SavingsTrendCardProps) {
  const maxSavingsTrendVal = Math.max(
    ...trendData.map((d) => Math.max(d.income, d.expense, 1)),
  );

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget select-none w-full">
      <CardHeader className="p-0 pb-4 border-b border-[var(--card-border)] mb-6 flex flex-col items-start gap-1">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Activity size={14} className="text-blue-500" />
          Trend Ultimi 6 Mesi
        </h4>
        <p className="text-[10px] text-[var(--text-muted)]">
          Confronto entrate (sinistra) e uscite (destra)
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-56 flex items-end justify-between gap-4 pt-4">
          {trendData.map((d, index) => {
            const incHeight = (d.income / maxSavingsTrendVal) * 100;
            const expHeight = (d.expense / maxSavingsTrendVal) * 100;
            const isNetPositive = d.savings >= 0;

            return (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center h-full justify-end gap-2 group"
              >
                <div className="flex items-end justify-center gap-1.5 w-full h-full relative">
                  <div className="absolute bottom-full mb-2 bg-[var(--foreground)] text-[var(--background)] px-2 py-1.5 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-0.5 pointer-events-none shadow-md">
                    <span>
                      Entrate: {formatCurrency(d.income, displayCurrency)}
                    </span>
                    <span>
                      Uscite: {formatCurrency(d.expense, displayCurrency)}
                    </span>
                    <span
                      className={
                        isNetPositive ? "text-emerald-400" : "text-rose-400"
                      }
                    >
                      Risparmio: {formatCurrency(d.savings, displayCurrency)}
                    </span>
                  </div>

                  <div className="w-2.5 bg-neutral-500/10 rounded-full h-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${incHeight}%` }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                      className="w-full bg-[#34c759] rounded-full"
                    />
                  </div>

                  <div className="w-2.5 bg-neutral-500/10 rounded-full h-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${expHeight}%` }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.05 + 0.1,
                        ease: "easeOut",
                      }}
                      className="w-full bg-[#ff3b30] rounded-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center mt-1">
                  <span className="text-[10px] font-extrabold text-[var(--foreground)]">
                    {d.label}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-bold mt-0.5 font-mono",
                      isNetPositive ? "text-emerald-500" : "text-rose-500",
                    )}
                  >
                    {d.savings >= 0 ? "+" : ""}
                    {d.savings === 0
                      ? "0"
                      : d.savings > 0
                        ? d.savings > 1000
                          ? `${(d.savings / 1000).toFixed(0)}k`
                          : d.savings.toFixed(0)
                        : d.savings < -1000
                          ? `${(d.savings / 1000).toFixed(0)}k`
                          : d.savings.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
