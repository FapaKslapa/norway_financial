"use client";

import { Button, Card, CardContent } from "@heroui/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { AlertTriangle, CreditCard, Sliders, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");

type BudgetProgressCardProps = {
  totalExpense: number;
  targetBudgetVal: number;
  maxBudgetVal: number;
  displayCurrency: string;
  onOpenSettings: () => void;
};

export function BudgetProgressCard({
  totalExpense,
  targetBudgetVal,
  maxBudgetVal,
  displayCurrency,
  onOpenSettings,
}: BudgetProgressCardProps) {
  const today = dayjs();
  const daysInMonth = today.daysInMonth();
  const dayOfMonth = today.date();
  const daysRemaining = daysInMonth - dayOfMonth;

  const dailyAvg = dayOfMonth > 0 ? totalExpense / dayOfMonth : 0;

  const projectedMonthly = dailyAvg * daysInMonth;

  const budgetProgressPercent =
    maxBudgetVal > 0 ? Math.min((totalExpense / maxBudgetVal) * 100, 100) : 0;

  const targetProgressPercent =
    targetBudgetVal > 0
      ? Math.min((totalExpense / targetBudgetVal) * 100, 100)
      : 0;

  const isOverTarget = totalExpense > targetBudgetVal;
  const isOverMax = totalExpense > maxBudgetVal;
  const isProjectedOverMax = projectedMonthly > maxBudgetVal;
  const isProjectedOverTarget = projectedMonthly > targetBudgetVal;

  const budgetColorClass = isOverMax
    ? "stroke-red-500"
    : isOverTarget
      ? "stroke-amber-500"
      : "stroke-emerald-500";

  const budgetTextColor = isOverMax
    ? "text-red-500"
    : isOverTarget
      ? "text-amber-500"
      : "text-emerald-500";

  const projectedColor = isProjectedOverMax
    ? "text-red-400"
    : isProjectedOverTarget
      ? "text-amber-400"
      : "text-emerald-400";

  const remainingBudget = maxBudgetVal - totalExpense;

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget h-full flex flex-col justify-between transition-all select-none relative overflow-hidden">
      <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
            <CreditCard size={15} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs">Budget Mensile</span>
            <span className="text-[9px] text-[var(--text-muted)]">
              {daysRemaining} giorni rimanenti
            </span>
          </div>
        </div>
        <Button
          isIconOnly
          variant="ghost"
          className="text-[var(--text-muted)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl h-7 w-7 min-w-7 cursor-pointer flex items-center justify-center"
          onPress={onOpenSettings}
        >
          <Sliders size={12} />
        </Button>
      </div>

      <CardContent className="p-0 flex flex-col items-center justify-center gap-5 py-1">
        {}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 128 128"
          >
            <title>Progresso Budget</title>
            {}
            <circle
              cx="64"
              cy="64"
              r="52"
              className="stroke-neutral-200 dark:stroke-neutral-800"
              strokeWidth="8"
              fill="transparent"
            />
            {}
            {targetBudgetVal > 0 && targetBudgetVal <= maxBudgetVal && (
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#10b981"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`2 ${326.7 - 2}`}
                strokeDashoffset={
                  -(326.7 * ((targetBudgetVal / maxBudgetVal) * 100)) / 100
                }
                opacity={0.5}
              />
            )}
            {}
            <motion.circle
              cx="64"
              cy="64"
              r="52"
              className={budgetColorClass}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="326.7"
              initial={{ strokeDashoffset: 326.7 }}
              animate={{
                strokeDashoffset: 326.7 - (326.7 * budgetProgressPercent) / 100,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span
              className={cn("text-lg font-black leading-none", budgetTextColor)}
            >
              {budgetProgressPercent.toFixed(0)}%
            </span>
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-extrabold mt-1">
              del max
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1.5">
          {}
          <div className="flex justify-between items-center text-xs font-bold px-1">
            <span className="text-[var(--text-muted)] text-[10px]">
              Spesa attuale:
            </span>
            <span className={budgetTextColor}>
              {formatCurrency(totalExpense, displayCurrency)}
            </span>
          </div>

          {}
          <div className="flex flex-col gap-1 px-1 pt-2 border-t border-[var(--card-border)]">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[var(--text-muted)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Target:
              </span>
              <span className="font-semibold">
                {formatCurrency(targetBudgetVal, displayCurrency)}
              </span>
            </div>
            <div className="h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isOverTarget ? "bg-amber-500" : "bg-emerald-500",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(targetProgressPercent, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {}
          <div className="flex justify-between items-center text-[10px] px-1">
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Limite max:
            </span>
            <span className="font-semibold">
              {formatCurrency(maxBudgetVal, displayCurrency)}
            </span>
          </div>

          {}
          {!isOverMax && (
            <div className="flex justify-between items-center text-[10px] px-1 py-1.5 bg-neutral-500/5 rounded-xl mt-1">
              <span className="text-[var(--text-muted)]">Rimasto:</span>
              <span className="font-black text-emerald-500">
                {formatCurrency(Math.max(remainingBudget, 0), displayCurrency)}
              </span>
            </div>
          )}

          {}
          {isOverMax && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-500 bg-red-500/5 border border-red-500/15 rounded-xl px-2.5 py-2 mt-1">
              <AlertTriangle size={11} />
              Limite massimo superato di{" "}
              {formatCurrency(Math.abs(remainingBudget), displayCurrency)}
            </div>
          )}

          {}
          <div className="flex justify-between items-center text-[10px] px-1 border-t border-[var(--card-border)] pt-2 mt-1">
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <TrendingUp size={10} className={projectedColor} />
              Proiezione fine mese:
            </span>
            <span className={cn("font-bold text-[10px]", projectedColor)}>
              {formatCurrency(projectedMonthly, displayCurrency)}
            </span>
          </div>

          {}
          <div className="flex justify-between items-center text-[10px] px-1 text-[var(--text-muted)]">
            <span>Media giornaliera:</span>
            <span className="font-semibold">
              {formatCurrency(dailyAvg, displayCurrency)}/giorno
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
