"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { cn, formatCurrency } from "@/lib/utils";

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
  currency: string;
  date: string | Date;
};

type RecentLogsProps = {
  sortedTimeline: Transaction[];
  categories: Category[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function RecentLogs({
  sortedTimeline,
  categories,
  displayCurrency,
  convertCurrency,
}: RecentLogsProps) {
  const convertNokAmount = (nokVal: string) =>
    convertCurrency(parseFloat(nokVal) || 0, "NOK", displayCurrency);

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card-solid)] shadow-xl p-4 md:p-6 rounded-[2rem] w-full h-full flex flex-col">
      <CardHeader className="p-0 pb-3 md:pb-4 border-b border-[var(--card-border)] mb-3 md:mb-6 flex flex-col items-start gap-1 flex-shrink-0">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Clock size={14} className="text-blue-500" />
          Timeline delle Spese
        </h4>
        <p className="text-[10px] text-[var(--text-muted)]">
          Movimenti del mese selezionato
        </p>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin flex flex-col">
        {sortedTimeline.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)] flex flex-col gap-1">
            <span>Nessun movimento trovato.</span>
          </div>
        ) : (
          <>
            {/* Mobile: flat list */}
            <div className="flex md:hidden flex-col gap-2">
              {sortedTimeline.map((tx) => {
                const txDate = new Date(tx.date);
                const isExpense = tx.type === "expense";
                const dbCat = categories.find((c) => c.id === tx.categoryId);
                const color = dbCat?.color || "#8e8e93";
                const icon = dbCat?.icon || "HelpCircle";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-zinc-950/20 border border-neutral-200/50 dark:border-zinc-800/50 select-none"
                  >
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <CategoryIcon name={icon} size={14} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold truncate text-[var(--foreground)]">
                        {tx.description || "Nessuna descrizione"}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase mt-0.5">
                        {dbCat?.name || "Altro"} · {dayjs(txDate).format("D MMM")}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "text-xs font-black tracking-tight flex-shrink-0",
                        isExpense ? "text-rose-500" : "text-emerald-500",
                      )}
                    >
                      {isExpense ? "-" : "+"}
                      {formatCurrency(convertNokAmount(tx.amountNok), displayCurrency)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Desktop: timeline with line and dots */}
            <div className="hidden md:block relative">
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-neutral-100 dark:bg-zinc-800/80" />

              <div className="flex flex-col gap-4">
                {sortedTimeline.map((tx) => {
                  const txDate = new Date(tx.date);
                  const isExpense = tx.type === "expense";
                  const dbCat = categories.find((c) => c.id === tx.categoryId);
                  const color = dbCat?.color || "#8e8e93";
                  const icon = dbCat?.icon || "HelpCircle";

                  return (
                    <div
                      key={tx.id}
                      className="relative flex justify-between items-center pl-8 p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-950/20 border border-neutral-200/50 dark:border-zinc-800/50 select-none ml-6"
                    >
                      <div className="absolute left-[-17px] top-[21px] w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm z-10">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
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
                          {formatCurrency(convertNokAmount(tx.amountNok), displayCurrency)}
                        </span>

                        {tx.currency !== displayCurrency && (
                          <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase mt-0.5">
                            {tx.amount} {tx.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
