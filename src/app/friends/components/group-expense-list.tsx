"use client";

import { Activity, Calendar } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type TransactionInfo = {
  id: string;
  userId: string;
  payerName?: string | null;
  amountEur: string;
  amountNok: string;
  description: string | null;
  date: Date;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
  } | null;
};

type GroupExpenseListProps = {
  transactions: TransactionInfo[];
  allTransactions: TransactionInfo[];
  currentUserId: string;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function GroupExpenseList({
  transactions,
  allTransactions,
  currentUserId,
  displayCurrency,
  convertCurrency,
}: GroupExpenseListProps) {
  return (
    <div className="flex flex-col flex-1">
      <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Activity size={12} className="opacity-60" />
        Cronologia Spese Gruppo
      </h4>

      <div className="flex-1 overflow-y-auto max-h-[200px] pr-1 flex flex-col gap-2.5">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-(--text-muted) font-semibold">
            Nessuna spesa inserita per questo gruppo.
          </div>
        ) : (
          transactions.map((tx) => {
            const isPayer = tx.userId === currentUserId;

            let activeAmount = 0;
            if (isPayer) {
              const totalNok = parseFloat(tx.amountNok);
              const totalOthersSplitsNok = allTransactions
                .filter(
                  (t) =>
                    t.id === tx.id &&
                    t.sharedInfo &&
                    t.sharedInfo.payerId === currentUserId,
                )
                .reduce(
                  (sum, t) =>
                    sum + parseFloat(t.sharedInfo?.splitAmountNok ?? "0"),
                  0,
                );

              const myShareNok = totalNok - totalOthersSplitsNok;
              activeAmount = convertCurrency(
                myShareNok,
                "NOK",
                displayCurrency,
              );
            } else {
              const mySplit = allTransactions.find(
                (t) =>
                  t.id === tx.id &&
                  t.sharedInfo &&
                  t.sharedInfo.borrowerId === currentUserId,
              );

              const splitNok = mySplit?.sharedInfo
                ? parseFloat(mySplit.sharedInfo.splitAmountNok)
                : 0;
              activeAmount = convertCurrency(splitNok, "NOK", displayCurrency);
            }

            const originalAmount = convertCurrency(
              parseFloat(tx.amountEur),
              "EUR",
              displayCurrency,
            );

            return (
              <div
                key={tx.id}
                className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-(--card-border) shrink-0"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate leading-tight">
                    {tx.description || "Spesa gruppo"}
                  </span>
                  <span className="text-[8px] text-(--text-muted) font-semibold flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={9} />
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      {isPayer
                        ? "Hai pagato tu"
                        : `Ha pagato ${tx.payerName || "Membro"}`}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={cn(
                      "text-xs font-black",
                      isPayer ? "text-emerald-500" : "text-rose-500",
                    )}
                  >
                    {isPayer ? "+" : "-"}{" "}
                    {formatCurrency(activeAmount, displayCurrency)}
                  </span>
                  <span className="text-[8px] text-(--text-muted) font-semibold mt-0.5">
                    Totale: {formatCurrency(originalAmount, displayCurrency)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
