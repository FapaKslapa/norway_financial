"use client";

import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

type StatsGridProps = {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  displayCurrency: string;
};

export function StatsGrid({
  totalIncome,
  totalExpense,
  netSavings,
  displayCurrency,
}: StatsGridProps) {
  return (
    <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-1 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
      <div className="snap-start shrink-0 w-[72vw] md:w-auto scroll-ml-4">
        <StatCard
          title="Entrate (Mese)"
          value={formatCurrency(totalIncome, displayCurrency)}
          subtitle="Questo mese"
          icon={<TrendingUp size={14} />}
          iconBgColor="bg-emerald-500/10"
          iconColor="text-emerald-500"
          delayIndex={0}
        />
      </div>

      <div className="snap-start shrink-0 w-[72vw] md:w-auto scroll-ml-4">
        <StatCard
          title="Uscite (Mese)"
          value={formatCurrency(totalExpense, displayCurrency)}
          subtitle="Questo mese"
          icon={<TrendingDown size={14} />}
          iconBgColor="bg-rose-500/10"
          iconColor="text-rose-500"
          delayIndex={1}
        />
      </div>

      <div className="snap-start shrink-0 w-[72vw] md:w-auto scroll-ml-4">
        <StatCard
          title="Bilancio Netto"
          value={formatCurrency(netSavings, displayCurrency)}
          valueClassName={
            netSavings >= 0 ? "text-emerald-500" : "text-rose-500"
          }
          subtitle="Risparmio netto mensile"
          icon={<DollarSign size={14} />}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
          delayIndex={2}
        />
      </div>
    </div>
  );
}
