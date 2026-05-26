"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { motion } from "framer-motion";
import { CreditCard, Sliders } from "lucide-react";
import { formatCurrency } from "../../../lib/utils";

type BudgetProgressCardProps = {
  totalExpense: number;
  targetBudgetVal: number;
  maxBudgetVal: number;
  displayCurrency: "EUR" | "NOK";
  onOpenSettings: () => void;
};

export function BudgetProgressCard({
  totalExpense,
  targetBudgetVal,
  maxBudgetVal,
  displayCurrency,
  onOpenSettings,
}: BudgetProgressCardProps) {
  const budgetProgressPercent = Math.min(
    (totalExpense / maxBudgetVal) * 100,
    100,
  );
  const isOverTarget = totalExpense > targetBudgetVal;
  const isOverMax = totalExpense > maxBudgetVal;

  const budgetColorClass = isOverMax
    ? "stroke-red-500"
    : isOverTarget
      ? "stroke-amber-500"
      : "stroke-emerald-500";

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget h-full flex flex-col justify-between transition-all select-none relative overflow-hidden">
      <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
            <CreditCard size={15} />
          </div>
          <span className="font-bold text-xs">Budget Mensile</span>
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

      <CardContent className="p-0 flex flex-col items-center justify-center gap-6 py-2">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 128 128"
          >
            <title>Progresso Budget</title>
            <circle
              cx="64"
              cy="64"
              r="52"
              className="stroke-neutral-200 dark:stroke-neutral-800"
              strokeWidth="8"
              fill="transparent"
            />
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
              className={cn(
                "text-lg font-black leading-none",
                isOverMax
                  ? "text-red-500"
                  : isOverTarget
                    ? "text-amber-500"
                    : "text-emerald-500",
              )}
            >
              {budgetProgressPercent.toFixed(0)}%
            </span>
            <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider font-extrabold mt-1">
              Speso
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-bold px-1">
            <span className="text-[var(--text-muted)] text-[10px]">
              Spesa Attuale:
            </span>
            <span>{formatCurrency(totalExpense, displayCurrency)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] px-1 border-t border-[var(--card-border)] pt-2">
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
              Target desiderato:
            </span>
            <span className="font-semibold">
              {formatCurrency(targetBudgetVal, displayCurrency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] px-1">
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Limite
              massimo:
            </span>
            <span className="font-semibold">
              {formatCurrency(maxBudgetVal, displayCurrency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
