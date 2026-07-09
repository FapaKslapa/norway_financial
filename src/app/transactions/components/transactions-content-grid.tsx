import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { CategoryTotalsCard } from "./category-totals-card";
import { RecurrentTransactionsManager } from "./recurrent-transactions-manager";
import { TransactionListTimeline } from "./transaction-list-timeline";
import { TransactionTable } from "./transaction-table";
import type {
  NormalizedTransaction,
  SortField,
  ViewMode,
} from "./transactions-utils";

type Category = { id: string; name: string; icon: string; color: string };

type CategoryTotal = {
  amountEur: number;
  count: number;
  color: string;
  icon: string;
  name: string;
};

interface TransactionsContentGridProps {
  viewMode: ViewMode;
  activeMobileTab: "list" | "summary" | "filters";
  groupedTx: { date: string; list: NormalizedTransaction[] }[];
  paginatedTxList: NormalizedTransaction[];
  totalItems: number;
  currentPage: number;
  onChangePage: (page: number) => void;
  categories: Category[];
  categoryTotals: CategoryTotal[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onSortChange: (field: SortField) => void;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: NormalizedTransaction) => void;
}

export function TransactionsContentGrid({
  viewMode,
  activeMobileTab,
  groupedTx,
  paginatedTxList,
  totalItems,
  currentPage,
  onChangePage,
  categories,
  categoryTotals,
  displayCurrency,
  convertCurrency,
  sortField,
  sortDirection,
  onSortChange,
  onDeleteClick,
  onEditClick,
}: TransactionsContentGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          viewMode === "recurrent"
            ? "lg:col-span-4 flex flex-col gap-6"
            : "lg:col-span-3 flex flex-col gap-6",
          activeMobileTab !== "list" && "hidden lg:flex",
        )}
      >
        {viewMode === "recurrent" ? (
          <RecurrentTransactionsManager categories={categories} />
        ) : viewMode === "timeline" ? (
          <TransactionListTimeline
            groupedTx={groupedTx}
            categories={categories}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
            onDeleteClick={onDeleteClick}
            onEditClick={(tx) => onEditClick(tx as NormalizedTransaction)}
          />
        ) : (
          <TransactionTable
            transactions={paginatedTxList}
            totalItems={totalItems}
            currentPage={currentPage}
            onChangePage={onChangePage}
            categories={categories}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            onDeleteClick={onDeleteClick}
            onEditClick={(tx) => onEditClick(tx as NormalizedTransaction)}
          />
        )}
      </m.div>

      {viewMode !== "recurrent" && (
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "lg:col-span-1",
            activeMobileTab !== "summary" && "hidden lg:block",
          )}
        >
          <CategoryTotalsCard
            categoryTotals={categoryTotals}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
          />
        </m.div>
      )}
    </div>
  );
}
