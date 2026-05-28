"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn, formatCurrency } from "@/lib/utils";

type MonthTrend = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

type SavingsTrendCardProps = {
  trendData: MonthTrend[];
  displayCurrency: string;
};

export function SavingsTrendCard({
  trendData,
  displayCurrency,
}: SavingsTrendCardProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    d: MonthTrend;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxSavingsTrendVal = Math.max(
    ...trendData.map((d) => Math.max(d.income, d.expense, 1)),
  );

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget select-none w-full h-full flex flex-col">
      <CardHeader className="p-0 pb-4 border-b border-[var(--card-border)] mb-6 flex flex-col items-start gap-1 flex-shrink-0">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Activity size={14} className="text-blue-500" />
          Trend Ultimi 6 Mesi
        </h4>
        <p className="text-[10px] text-[var(--text-muted)]">
          Confronto entrate (sinistra) e uscite (destra)
        </p>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-end">
        <div className="h-56 flex items-end justify-between gap-4 pt-4">
          {trendData.map((d, index) => {
            const incHeight = (d.income / maxSavingsTrendVal) * 100;
            const expHeight = (d.expense / maxSavingsTrendVal) * 100;
            const isNetPositive = d.savings >= 0;

            return (
              <button
                type="button"
                key={d.label}
                className="flex-1 flex flex-col items-center h-full justify-end gap-2 cursor-pointer bg-transparent border-0 p-0"
                onMouseEnter={(e) =>
                  setTooltip({ x: e.clientX, y: e.clientY, d })
                }
                onMouseMove={(e) =>
                  setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
                  )
                }
                onMouseLeave={() => setTooltip(null)}
                onClick={(e) =>
                  setTooltip((prev) =>
                    prev ? null : { x: e.clientX, y: e.clientY, d },
                  )
                }
              >
                <div className="flex items-end justify-center gap-1.5 w-full h-full relative">
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
                      : Math.abs(d.savings) > 1000
                        ? `${d.savings > 0 ? "" : "-"}${(Math.abs(d.savings) / 1000).toFixed(0)}k`
                        : d.savings.toFixed(0)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>

      {mounted &&
        tooltip &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2.5 py-1.5 rounded-xl text-[9px] font-bold shadow-lg flex flex-col gap-0.5"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, calc(-100% - 10px))",
            }}
          >
            <span className="opacity-60 uppercase text-[7px] tracking-wider font-extrabold">
              {tooltip.d.label}
            </span>
            <span className="text-emerald-400">
              ↑ {formatCurrency(tooltip.d.income, displayCurrency)}
            </span>
            <span className="text-rose-400">
              ↓ {formatCurrency(tooltip.d.expense, displayCurrency)}
            </span>
            <span
              className={cn(
                "font-sans font-black",
                tooltip.d.savings >= 0 ? "text-emerald-300" : "text-rose-300",
              )}
            >
              {tooltip.d.savings >= 0 ? "+" : ""}
              {formatCurrency(tooltip.d.savings, displayCurrency)}
            </span>
          </div>,
          document.body,
        )}
    </Card>
  );
}
