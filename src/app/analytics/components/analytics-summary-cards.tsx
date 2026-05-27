"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

type AnalyticsSummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  displayCurrency: string;
};

export function AnalyticsSummaryCards({
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  displayCurrency,
}: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      <StatCard
        title="Entrate totali"
        value={formatCurrency(totalIncome, displayCurrency)}
        icon={<ArrowDownRight className="rotate-90" size={20} />}
        iconBgColor="bg-emerald-500/10"
        iconColor="text-emerald-500"
        delayIndex={0}
      />

      <StatCard
        title="Uscite totali"
        value={formatCurrency(totalExpense, displayCurrency)}
        icon={<ArrowUpRight size={20} />}
        iconBgColor="bg-rose-500/10"
        iconColor="text-rose-500"
        delayIndex={1}
      />

      <StatCard
        title="Risparmio Netto"
        value={formatCurrency(netSavings, displayCurrency)}
        valueClassName={netSavings >= 0 ? "text-emerald-500" : "text-rose-500"}
        icon={
          netSavings >= 0 ? (
            <TrendingUp size={20} />
          ) : (
            <TrendingDown size={20} />
          )
        }
        iconBgColor={netSavings >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10"}
        iconColor={netSavings >= 0 ? "text-emerald-500" : "text-rose-500"}
        delayIndex={2}
      />

      <StatCard
        title="Tasso Risparmio"
        value={savingsRate > 0 ? `${savingsRate.toFixed(0)}%` : "0%"}
        icon={<span className="font-bold text-xs select-none">%</span>}
        iconBgColor="bg-blue-500/10"
        iconColor="text-blue-500"
        delayIndex={3}
      />
    </div>
  );
}
