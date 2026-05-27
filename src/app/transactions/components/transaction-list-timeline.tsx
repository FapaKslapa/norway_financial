"use client";

import { Button, Card } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { cn, formatCurrency } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type SharedInfo = {
  id: string;
  payerId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  splitAmountNok: string;
  settled: boolean;
  isBorrowed: boolean;
  isPaidByMe: boolean;
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
  payerName: string | null;
  payerEmail: string | null;
  sharedInfo: SharedInfo | null;
};

type GroupedTransaction = {
  date: string;
  list: Transaction[];
};

type TransactionListTimelineProps = {
  groupedTx: GroupedTransaction[];
  categories: Category[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onDeleteClick: (id: string) => void;
};

function resolveDisplayAmount(
  tx: Transaction,
  displayCurrency: string,
  convertCurrency: (amount: number, from: string, to: string) => number,
): number {
  if (tx.sharedInfo) {
    const splitNok = parseFloat(tx.sharedInfo.splitAmountNok);
    const totalNok = parseFloat(tx.amountNok);
    const myNok = tx.sharedInfo.isBorrowed ? splitNok : totalNok - splitNok;
    return convertCurrency(myNok, "NOK", displayCurrency);
  }
  return convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency);
}

function OriginalAmountHint({
  tx,
  displayCurrency,
  convertCurrency,
}: {
  tx: Transaction;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
}) {
  if (tx.currency === displayCurrency) return null;
  const converted = convertCurrency(
    parseFloat(tx.amount),
    tx.currency,
    displayCurrency,
  );
  return (
    <span className="text-[9px] text-[var(--text-muted)] font-medium flex items-center gap-0.5">
      {tx.amount} {tx.currency} → {formatCurrency(converted, displayCurrency)}
    </span>
  );
}

export function TransactionListTimeline({
  groupedTx,
  categories,
  displayCurrency,
  convertCurrency,
  onDeleteClick,
}: TransactionListTimelineProps) {
  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card-solid)] shadow-xl p-6 rounded-[2rem] transition-all max-h-[600px] flex flex-col">
      <div className="relative flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin flex flex-col">
        {groupedTx.length > 0 && (
          <div className="absolute left-[11px] md:left-[15px] top-6 bottom-6 w-[2px] bg-neutral-100 dark:bg-zinc-800/80" />
        )}

        {groupedTx.map((group) => (
          <div key={group.date} className="flex flex-col">
            {}
            <div className="relative pl-8 pt-4 pb-2 select-none">
              <div className="absolute left-[8px] md:left-[12px] top-[21px] w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900" />
              <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                {group.date}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {group.list.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const isExpense = tx.type === "expense";
                const displayAmount = resolveDisplayAmount(
                  tx,
                  displayCurrency,
                  convertCurrency,
                );

                return (
                  <div
                    key={tx.id}
                    className="relative flex justify-between items-center pl-8 p-3 rounded-2xl bg-neutral-50 dark:bg-zinc-950/20 border border-neutral-200/50 dark:border-zinc-800/50 group select-none ml-4 md:ml-6"
                  >
                    {}
                    <div className="absolute left-[-17px] top-[21px] w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm z-10">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: cat ? cat.color : "#8E8E93" }}
                      />
                    </div>

                    {}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="p-2.5 rounded-xl text-white flex-shrink-0"
                        style={{ backgroundColor: cat ? cat.color : "#8E8E93" }}
                      >
                        <CategoryIcon
                          name={cat ? cat.icon : "Sparkles"}
                          size={15}
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[var(--foreground)] truncate">
                            {tx.description || "Transazione"}
                          </span>
                          {tx.sharedInfo && (
                            <span
                              className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded-md",
                                tx.sharedInfo.isBorrowed
                                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/15"
                                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15",
                              )}
                            >
                              {tx.sharedInfo.isBorrowed
                                ? `Split da ${tx.payerName || "Amico"}`
                                : `Split con ${tx.sharedInfo.borrowerName}`}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wide">
                          {cat ? cat.name : "Generale"}
                        </span>
                      </div>
                    </div>

                    {}
                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-xs font-black ${isExpense ? "text-[var(--foreground)]" : "text-emerald-500"}`}
                        >
                          {isExpense ? "-" : "+"}{" "}
                          {formatCurrency(displayAmount, displayCurrency)}
                        </span>

                        {tx.sharedInfo ? (
                          <span className="text-[8px] text-[var(--text-muted)] font-semibold mt-0.5">
                            {tx.sharedInfo.isBorrowed
                              ? "Tua quota"
                              : `Totale: ${formatCurrency(
                                  convertCurrency(
                                    parseFloat(tx.amountEur),
                                    "EUR",
                                    displayCurrency,
                                  ),
                                  displayCurrency,
                                )}`}
                          </span>
                        ) : (
                          <OriginalAmountHint
                            tx={tx}
                            displayCurrency={displayCurrency}
                            convertCurrency={convertCurrency}
                          />
                        )}
                      </div>

                      <Button
                        isIconOnly
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-500/15 rounded-lg border-0 h-8 w-8 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={() => onDeleteClick(tx.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groupedTx.length === 0 && (
          <div className="text-center py-12 text-xs text-[var(--text-muted)] font-medium">
            Nessuna transazione corrisponde ai criteri impostati.
          </div>
        )}
      </div>
    </Card>
  );
}
