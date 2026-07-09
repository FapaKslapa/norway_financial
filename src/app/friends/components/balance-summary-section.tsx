"use client";

import { ArrowUpRight, Coins, Scale } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

interface BalanceSummarySectionProps {
  totalYouAreOwed: number;
  totalYouOwe: number;
  netBalance: number;
  displayCurrency: string;
  convertAmount: (val: number) => number;
}

export function BalanceSummarySection({
  totalYouAreOwed,
  totalYouOwe,
  netBalance,
  displayCurrency,
  convertAmount,
}: BalanceSummarySectionProps) {
  const stats = [
    {
      label: "Ti devono in totale",
      value: formatCurrency(convertAmount(totalYouAreOwed), displayCurrency),
      color: "text-emerald-500",
      icon: <Coins size={16} />,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      delayIndex: 0,
    },
    {
      label: "Devi dare in totale",
      value: formatCurrency(convertAmount(totalYouOwe), displayCurrency),
      color: "text-rose-500",
      icon: <ArrowUpRight size={16} />,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-500",
      delayIndex: 1,
    },
    {
      label: "Bilancio Netto Amici",
      value: formatCurrency(convertAmount(netBalance), displayCurrency),
      color: netBalance >= 0 ? "text-emerald-500" : "text-rose-500",
      icon: <Scale size={16} />,
      iconBg: netBalance >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      iconColor: netBalance >= 0 ? "text-emerald-500" : "text-rose-500",
      delayIndex: 2,
    },
  ];

  return (
    <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-1 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          title={stat.label}
          value={stat.value}
          valueClassName={stat.color}
          icon={stat.icon}
          iconBgColor={stat.iconBg}
          iconColor={stat.iconColor}
          delayIndex={stat.delayIndex}
          className="w-[85vw] md:w-full shrink-0 snap-start scroll-ml-4 bg-(--card) border border-(--card-border) rounded-[2rem] p-5 shadow-(--card-shadow)"
        />
      ))}
    </div>
  );
}
