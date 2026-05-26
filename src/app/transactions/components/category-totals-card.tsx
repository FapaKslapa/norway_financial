"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { CategoryIcon } from "../../../components/icon-helper";
import { formatCurrency } from "../../../lib/utils";

type CategoryTotal = {
  nok: number;
  eur: number;
  count: number;
  color: string;
  icon: string;
  name: string;
};

type CategoryTotalsCardProps = {
  categoryTotals: CategoryTotal[];
  displayCurrency: "NOK" | "EUR";
};

export function CategoryTotalsCard({
  categoryTotals,
  displayCurrency,
}: CategoryTotalsCardProps) {
  const totalExpensesAllCategoriesNok = categoryTotals.reduce(
    (sum, c) => sum + c.nok,
    0,
  );

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 apple-widget transition-all select-none">
      <CardHeader className="flex flex-col gap-0.5 p-0 mb-4 items-start">
        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">
          Distribuzione Spese
        </span>
        <h3 className="text-sm font-extrabold text-[var(--foreground)] font-sans">
          Totali per Categoria
        </h3>
        <p className="text-[10px] text-[var(--text-muted)]">
          Basato sui filtri attivi (Solo Uscite)
        </p>
      </CardHeader>
      <CardContent className="p-0 flex flex-col gap-3">
        {categoryTotals.map((tot) => {
          const totalAmount = displayCurrency === "NOK" ? tot.nok : tot.eur;
          const percentage =
            totalExpensesAllCategoriesNok > 0
              ? (tot.nok / totalExpensesAllCategoriesNok) * 100
              : 0;

          return (
            <div
              key={tot.name}
              className="flex flex-col gap-1.5 p-2 rounded-xl"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="p-1.5 rounded-lg text-white flex-shrink-0"
                    style={{ backgroundColor: tot.color }}
                  >
                    <CategoryIcon name={tot.icon} size={11} />
                  </div>
                  <span className="text-xs font-bold truncate text-[var(--foreground)]">
                    {tot.name}
                  </span>
                </div>
                <span className="text-xs font-black text-[var(--foreground)] font-mono">
                  {formatCurrency(totalAmount, displayCurrency)}
                </span>
              </div>
              <div className="w-full bg-neutral-500/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: tot.color,
                    width: `${percentage}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-wider pl-1">
                <span>
                  {tot.count} transazion{tot.count === 1 ? "e" : "i"}
                </span>
                <span>{percentage.toFixed(0)}% del totale</span>
              </div>
            </div>
          );
        })}

        {categoryTotals.length === 0 && (
          <div className="text-center py-6 text-xs text-[var(--text-muted)] font-medium">
            Nessuna spesa trovata per i criteri selezionati.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
