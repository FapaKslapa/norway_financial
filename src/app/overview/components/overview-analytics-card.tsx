"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import dayjs from "dayjs";
import { BarChart3 } from "lucide-react";
import { AnalyticsLineChart } from "./analytics-line-chart";

type Transaction = {
  date: Date | string;
  type: string;
  amountEur: string;
  amountNok: string;
};

type OverviewAnalyticsCardProps = {
  transactions: Transaction[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function OverviewAnalyticsCard({
  transactions,
  displayCurrency,
  convertCurrency,
}: OverviewAnalyticsCardProps) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = dayjs().subtract(11 - i, "month");
    const monthStart = m.startOf("month");
    const monthEnd = m.endOf("month");

    const monthTx = transactions.filter((t) => {
      const d = dayjs(t.date);
      return d.isAfter(monthStart) && d.isBefore(monthEnd);
    });

    let incomeEur = 0;
    let expenseEur = 0;
    for (const t of monthTx) {
      const val = parseFloat(t.amountEur);
      if (t.type === "income") {
        incomeEur += val;
      } else if (t.type === "expense") {
        expenseEur += val;
      }
    }

    const income = convertCurrency(incomeEur, "EUR", displayCurrency);
    const expense = convertCurrency(expenseEur, "EUR", displayCurrency);
    const savings = income - expense;

    return {
      label: m.format("MMM"),
      income,
      expense,
      savings,
    };
  });

  const maxVal = Math.max(
    ...months.map((m) => Math.max(m.income, m.expense)),
    1000,
  );

  return (
    <Card className="border border-(--card-border) bg-(--card-solid) shadow-xl p-6 rounded-[2rem] select-none w-full h-full flex flex-col">
      <CardHeader className="p-0 pb-4 border-b border-(--card-border) mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <BarChart3 size={14} className="text-blue-500" />
            Analisi Trend
          </h4>
          <p className="text-[10px] text-(--text-muted)">
            Entrate e Spese degli ultimi 12 mesi
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#34c759] shadow-sm" />
            <span className="text-(--text-muted) font-mono">Entrate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff3b30] shadow-sm" />
            <span className="text-(--text-muted) font-mono">Spese</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative flex-1 min-h-0">
        <AnalyticsLineChart
          months={months}
          maxVal={maxVal}
          displayCurrency={displayCurrency}
        />
      </CardContent>
    </Card>
  );
}
