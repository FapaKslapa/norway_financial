"use client";

import { Card } from "@heroui/react";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/icon-helper";
import { cn, formatCurrency } from "@/lib/utils";

type TransactionType = {
  id: string;
  type: string;
  amount: string;
  currency: string;
  amountEur: string;
  amountNok: string;
  exchangeRate: string;
  description: string | null;
  date: Date;
  payerName?: string | null;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    borrowerName: string;
    borrowerEmail: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
    isPaidByMe: boolean;
  } | null;
  categoryId: string | null;
};

type CategoryType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type RecentTransactionsCardProps = {
  transactions: TransactionType[];
  categories: CategoryType[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function RecentTransactionsCard({
  transactions,
  categories,
  displayCurrency,
  convertCurrency,
}: RecentTransactionsCardProps) {
  const expenses = transactions
    .filter((tx) => tx.type === "expense")
    .slice(0, 20);

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 apple-widget flex flex-col transition-all h-full">
      <div className="flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 flex-shrink-0">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
            <TrendingUp size={15} />
          </div>
          <span className="font-bold text-xs">Spese Recenti</span>
        </div>
        <Link
          href="/transactions"
          className="text-xs text-blue-500 font-bold flex items-center gap-0.5 hover:underline"
        >
          Vedi tutte <ArrowRight size={12} />
        </Link>
      </div>

      <div className="overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin flex-1 min-h-0">
        {expenses.map((tx) => {
          const cat = categories.find((c) => c.id === tx.categoryId);
          const isExpense = tx.type === "expense";

          const displayAmount = tx.sharedInfo
            ? tx.sharedInfo.isBorrowed
              ? convertCurrency(
                  parseFloat(tx.sharedInfo.splitAmountNok),
                  "NOK",
                  displayCurrency,
                )
              : convertCurrency(
                  parseFloat(tx.amountNok),
                  "NOK",
                  displayCurrency,
                ) -
                convertCurrency(
                  parseFloat(tx.sharedInfo.splitAmountNok),
                  "NOK",
                  displayCurrency,
                )
            : convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency);

          return (
            <div
              key={tx.id}
              className="flex justify-between items-center p-2.5 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="p-2 rounded-lg text-white flex-shrink-0"
                  style={{ backgroundColor: cat ? cat.color : "#8E8E93" }}
                >
                  <CategoryIcon name={cat ? cat.icon : "Sparkles"} size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold truncate text-[var(--foreground)]">
                      {tx.description || "Transazione"}
                    </span>
                    {tx.sharedInfo && (
                      <span
                        className={cn(
                          "text-[8px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0",
                          tx.sharedInfo.isBorrowed
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/15"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15",
                        )}
                      >
                        Split
                      </span>
                    )}
                  </div>
                  {tx.sharedInfo && (
                    <span className="text-[8px] text-[var(--text-muted)] font-normal mt-0.5 truncate">
                      {tx.sharedInfo.isBorrowed
                        ? `Quota da ${tx.payerName || "Amico"}`
                        : `Quota con ${tx.sharedInfo.borrowerName}`}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`text-xs font-black shrink-0 ${isExpense ? "text-[var(--foreground)]" : "text-emerald-500"}`}
              >
                {isExpense ? "-" : "+"}{" "}
                {formatCurrency(displayAmount, displayCurrency)}
              </span>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="text-center py-8 text-xs text-[var(--text-muted)] font-medium">
            Nessuna transazione registrata.
          </div>
        )}
      </div>
    </Card>
  );
}
