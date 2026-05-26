"use client";

import { Button, Card } from "@heroui/react";
import dayjs from "dayjs";
import { ArrowUpDown, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn, formatCurrency } from "../../../lib/utils";

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
  currency: "NOK" | "EUR";
  date: string | Date;
  payerName: string | null;
  payerEmail: string | null;
  sharedInfo: SharedInfo | null;
};

type SortFieldType = "date" | "description" | "category" | "type" | "amount";

type TransactionTableProps = {
  sortedTx: Transaction[];
  categories: Category[];
  displayCurrency: "NOK" | "EUR";
  exchangeRate: number;
  sortField: SortFieldType;
  sortDirection: "asc" | "desc";
  onSortChange: (field: SortFieldType) => void;
  onDeleteClick: (id: string) => void;
};

export function TransactionTable({
  sortedTx,
  categories,
  displayCurrency,
  exchangeRate,
  sortField,
  sortDirection,
  onSortChange,
  onDeleteClick,
}: TransactionTableProps) {
  const renderSortHeader = (field: SortFieldType, label: string) => {
    const isCurrent = sortField === field;
    return (
      <button
        type="button"
        onClick={() => onSortChange(field)}
        className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors font-bold uppercase tracking-wider text-[10px] cursor-pointer border-0 bg-transparent"
      >
        {label}
        {isCurrent ? (
          sortDirection === "asc" ? (
            <ChevronUp size={11} className="text-blue-500" />
          ) : (
            <ChevronDown size={11} className="text-blue-500" />
          )
        ) : (
          <ArrowUpDown size={10} className="text-neutral-500 opacity-60" />
        )}
      </button>
    );
  };

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-4 apple-widget transition-all">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-neutral-500/5 text-[9px] text-[var(--text-muted)] font-bold">
              <th className="p-3">{renderSortHeader("date", "Data")}</th>
              <th className="p-3">
                {renderSortHeader("description", "Descrizione")}
              </th>
              <th className="p-3">
                {renderSortHeader("category", "Categoria")}
              </th>
              <th className="p-3">{renderSortHeader("type", "Tipo")}</th>
              <th className="p-3">{renderSortHeader("amount", "Importo")}</th>
              <th className="p-3 text-right font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTx.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const isExpense = tx.type === "expense";

              const activeAmount =
                displayCurrency === "NOK"
                  ? tx.sharedInfo?.isBorrowed
                    ? parseFloat(tx.sharedInfo.splitAmountNok)
                    : parseFloat(tx.amountNok)
                  : tx.sharedInfo?.isBorrowed
                    ? parseFloat(tx.sharedInfo.splitAmountNok) / exchangeRate
                    : parseFloat(tx.amountEur);

              return (
                <tr
                  key={tx.id}
                  className="border-b border-[var(--card-border)] last:border-0"
                >
                  <td className="p-3 whitespace-nowrap text-[var(--text-muted)] font-medium">
                    {dayjs(tx.date).format("DD/MM/YYYY")}
                  </td>

                  <td className="p-3 font-bold text-[var(--foreground)] truncate max-w-[150px]">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">
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
                        <span className="text-[8px] text-[var(--text-muted)] font-normal mt-0.5">
                          {tx.sharedInfo.isBorrowed
                            ? `Da ${tx.payerName || "Amico"}`
                            : `Con ${tx.sharedInfo.borrowerName}`}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: cat ? cat.color : "#8E8E93",
                        }}
                      />
                      <span className="text-[var(--foreground)] font-semibold text-xs">
                        {cat ? cat.name : "Generale"}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                        isExpense
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/15"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15",
                      )}
                    >
                      {isExpense ? "Spesa" : "Guadagno"}
                    </span>
                  </td>

                  <td className="p-3 font-extrabold whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={
                          isExpense
                            ? "text-[var(--foreground)]"
                            : "text-emerald-500"
                        }
                      >
                        {isExpense ? "-" : "+"}{" "}
                        {formatCurrency(activeAmount, displayCurrency)}
                      </span>
                      <span className="text-[8px] text-[var(--text-muted)] font-medium mt-0.5">
                        {tx.currency === "EUR" ? (
                          <>
                            {tx.amount} EUR →{" "}
                            {parseFloat(tx.amountNok).toFixed(0)} NOK
                          </>
                        ) : (
                          <>
                            {tx.amount} NOK →{" "}
                            {parseFloat(tx.amountEur).toFixed(2)} EUR
                          </>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    <Button
                      isIconOnly
                      variant="ghost"
                      className="text-rose-500 hover:bg-rose-500/15 rounded-lg border-0 h-8 w-8 cursor-pointer"
                      onPress={() => onDeleteClick(tx.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </td>
                </tr>
              );
            })}

            {sortedTx.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-xs text-[var(--text-muted)] font-medium"
                >
                  Nessuna transazione corrisponde ai criteri impostati.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
