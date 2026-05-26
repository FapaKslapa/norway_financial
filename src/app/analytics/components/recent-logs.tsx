"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { CategoryIcon } from "../../../components/icon-helper";
import { cn, formatCurrency } from "../../../lib/utils";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Transaction = {
  id: string;
  userId: string;
  categoryId: string | null;
  description: string | null;
  type: "expense" | "income";
  amount: string;
  amountNok: string;
  amountEur: string;
  currency: "NOK" | "EUR";
  date: string | Date;
};

type RecentLogsProps = {
  sortedTimeline: Transaction[];
  categories: Category[];
  displayCurrency: "NOK" | "EUR";
  exchangeRate: number;
};

export function RecentLogs({
  sortedTimeline,
  categories,
  displayCurrency,
  exchangeRate,
}: RecentLogsProps) {
  const convertNokAmount = (nokVal: string) => {
    const val = parseFloat(nokVal) || 0;
    return displayCurrency === "NOK" ? val : val / exchangeRate;
  };

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card-solid)] shadow-xl p-6 rounded-[2rem] w-full">
      <CardHeader className="p-0 pb-4 border-b border-[var(--card-border)] mb-6 flex flex-col items-start gap-1">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Clock size={14} className="text-blue-500" />
          Timeline delle Spese
        </h4>
        <p className="text-[10px] text-[var(--text-muted)]">
          Evoluzione cronologica dei movimenti nel mese selezionato
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {sortedTimeline.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] flex flex-col gap-1">
            <span>Nessun movimento trovato per questa selezione.</span>
            <span className="text-[10px]">
              Aggiungi transazioni per vederle nella timeline.
            </span>
          </div>
        ) : (
          <div className="relative flex flex-col gap-4">
            <div className="absolute left-[11px] md:left-[15px] top-4 bottom-4 w-[2px] bg-neutral-100 dark:bg-zinc-800/80" />

            {sortedTimeline.map((tx) => {
              const txDate = new Date(tx.date);
              const isExpense = tx.type === "expense";
              const dbCat = categories.find((c) => c.id === tx.categoryId);
              const color = dbCat?.color || "#8e8e93";
              const icon = dbCat?.icon || "HelpCircle";

              return (
                <div
                  key={tx.id}
                  className="relative flex justify-between items-center pl-8 p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950/20 border border-neutral-200/50 dark:border-zinc-800/50 select-none ml-4 md:ml-6"
                >
                  <div className="absolute left-[-17px] top-[21px] w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm z-10">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <CategoryIcon name={icon} size={16} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate text-[var(--foreground)]">
                        {tx.description || "Nessuna descrizione"}
                      </span>
                      <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">
                        <span>{dbCat?.name || "Altro"}</span>
                        <span>•</span>
                        <span>{dayjs(txDate).format("D MMM, HH:mm")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className={cn(
                        "text-xs font-black tracking-tight",
                        isExpense ? "text-rose-500" : "text-emerald-500",
                      )}
                    >
                      {isExpense ? "-" : "+"}
                      {formatCurrency(
                        convertNokAmount(tx.amountNok),
                        displayCurrency,
                      )}
                    </span>

                    <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-0.5">
                      {tx.currency === "NOK" ? (
                        <>
                          Originale: {parseFloat(tx.amountNok).toFixed(0)} NOK
                        </>
                      ) : (
                        <>
                          Originale: {parseFloat(tx.amountEur).toFixed(2)} EUR
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
