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
    <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-1 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
      <div className="snap-start flex-shrink-0 w-[72vw] md:w-auto">
        <StatCard
          title="Entrate totali"
          value={formatCurrency(totalIncome, displayCurrency)}
          icon={<ArrowDownRight className="rotate-90" size={20} />}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
          delayIndex={0}
        />
      </div>

      <div className="snap-start flex-shrink-0 w-[72vw] md:w-auto">
        <StatCard
          title="Uscite totali"
          value={formatCurrency(totalExpense, displayCurrency)}
          icon={<ArrowUpRight size={20} />}
          iconBgColor="bg-rose-500/10"
          iconColor="text-rose-500"
          delayIndex={1}
        />
      </div>

      <div className="snap-start flex-shrink-0 w-[72vw] md:w-auto">
        <StatCard
          title="Risparmio Netto"
          value={formatCurrency(netSavings, displayCurrency)}
          valueClassName={
            netSavings >= 0 ? "text-emerald-500" : "text-rose-500"
          }
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
      </div>

      <div className="snap-start flex-shrink-0 w-[72vw] md:w-auto">
        <StatCard
          title="Tasso Risparmio"
          value={savingsRate > 0 ? `${savingsRate.toFixed(0)}%` : "0%"}
          icon={<span className="font-bold text-xs select-none">%</span>}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
          delayIndex={3}
        />
      </div>
    </div>
  );
}
