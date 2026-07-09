"use client";

import { Button, Card } from "@heroui/react";
import dayjs from "dayjs";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
} from "lucide-react";
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

type SortFieldType = "date" | "description" | "category" | "type" | "amount";

type TransactionTableProps = {
  transactions: Transaction[];
  totalItems: number;
  currentPage: number;
  onChangePage: (page: number) => void;
  categories: Category[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  sortField: SortFieldType;
  sortDirection: "asc" | "desc";
  onSortChange: (field: SortFieldType) => void;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
};

const ITEMS_PER_PAGE = 10;

function SortHeader({
  field,
  label,
  sortField,
  sortDirection,
  onSortChange,
}: {
  field: SortFieldType;
  label: string;
  sortField: SortFieldType;
  sortDirection: "asc" | "desc";
  onSortChange: (f: SortFieldType) => void;
}) {
  const isCurrent = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors font-bold uppercase tracking-wider text-[10px] cursor-pointer border-0 bg-transparent"
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
}

function AmountCell({
  tx,
  displayCurrency,
  convertCurrency,
}: {
  tx: Transaction;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
}) {
  const isExpense = tx.type === "expense";

  const displayAmount = tx.sharedInfo
    ? (() => {
        const splitNok = parseFloat(tx.sharedInfo.splitAmountNok);
        const totalNok = parseFloat(tx.amountNok);
        const myNok = tx.sharedInfo.isBorrowed ? splitNok : totalNok - splitNok;
        return convertCurrency(myNok, "NOK", displayCurrency);
      })()
    : convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency);

  const showHint = tx.currency !== displayCurrency;

  return (
    <div className="flex flex-col">
      <span className={isExpense ? "text-foreground" : "text-emerald-500"}>
        {isExpense ? "-" : "+"} {formatCurrency(displayAmount, displayCurrency)}
      </span>
      {showHint && (
        <span className="text-[8px] text-(--text-muted) font-medium mt-0.5">
          {tx.amount} {tx.currency}
        </span>
      )}
    </div>
  );
}

export function TransactionTable({
  transactions,
  totalItems,
  currentPage,
  onChangePage,
  categories,
  displayCurrency,
  convertCurrency,
  sortField,
  sortDirection,
  onSortChange,
  onDeleteClick,
  onEditClick,
}: TransactionTableProps) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const sortProps = { sortField, sortDirection, onSortChange };

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-4 apple-widget transition-all">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-(--card-border) bg-neutral-500/5 text-(--text-muted)">
              <th className="p-3">
                <SortHeader field="date" label="Data" {...sortProps} />
              </th>
              <th className="p-3">
                <SortHeader
                  field="description"
                  label="Descrizione"
                  {...sortProps}
                />
              </th>
              <th className="p-3">
                <SortHeader field="category" label="Categoria" {...sortProps} />
              </th>
              <th className="p-3">
                <SortHeader field="type" label="Tipo" {...sortProps} />
              </th>
              <th className="p-3">
                <SortHeader field="amount" label="Importo" {...sortProps} />
              </th>
              <th className="p-3 text-right font-bold uppercase tracking-wider text-[10px]">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const isExpense = tx.type === "expense";

              return (
                <tr
                  key={tx.id}
                  className="border-b border-(--card-border) last:border-0"
                >
                  {}
                  <td className="p-3 whitespace-nowrap text-(--text-muted) font-medium">
                    {dayjs(tx.date).format("DD/MM/YYYY")}
                  </td>

                  {}
                  <td className="p-3 font-bold text-foreground max-w-[150px]">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">
                          {tx.description || "Transazione"}
                        </span>
                        {tx.sharedInfo && (
                          <span
                            className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0",
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
                        <span className="text-[8px] text-(--text-muted) font-normal mt-0.5">
                          {tx.sharedInfo.isBorrowed
                            ? `Da ${tx.payerName || "Amico"}`
                            : `Con ${tx.sharedInfo.borrowerName}`}
                        </span>
                      )}
                    </div>
                  </td>

                  {}
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat ? cat.color : "#8E8E93" }}
                      />
                      <span className="text-foreground font-semibold text-xs">
                        {cat ? cat.name : "Generale"}
                      </span>
                    </div>
                  </td>

                  {}
                  <td className="p-3 whitespace-nowrap">
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

                  {}
                  <td className="p-3 font-extrabold whitespace-nowrap">
                    <AmountCell
                      tx={tx}
                      displayCurrency={displayCurrency}
                      convertCurrency={convertCurrency}
                    />
                  </td>

                  {}
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        isIconOnly
                        variant="ghost"
                        className="text-blue-500 hover:bg-blue-500/15 rounded-lg border-0 h-8 w-8 cursor-pointer"
                        onPress={() => onEditClick(tx)}
                      >
                        <Edit3 size={12} />
                      </Button>
                      <Button
                        isIconOnly
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-500/15 rounded-lg border-0 h-8 w-8 cursor-pointer"
                        onPress={() => onDeleteClick(tx.id)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {totalItems === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-xs text-(--text-muted) font-medium"
                >
                  Nessuna transazione corrisponde ai criteri impostati.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {}
      {totalItems > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-(--card-border) mt-4">
          <span className="text-[10px] text-(--text-muted) font-semibold uppercase tracking-wider pl-1">
            {startItem}–{endItem} di {totalItems}
          </span>
          <div className="flex gap-2 items-center">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onChangePage(currentPage - 1)}
              className="px-3 py-1.5 rounded-xl border border-(--card-border) bg-(--card) hover:bg-neutral-500/10 text-[10px] font-black uppercase tracking-wider text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ←
            </button>
            <span className="text-[10px] font-black px-2 text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onChangePage(currentPage + 1)}
              className="px-3 py-1.5 rounded-xl border border-(--card-border) bg-(--card) hover:bg-neutral-500/10 text-[10px] font-black uppercase tracking-wider text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
