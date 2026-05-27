"use client";

import { Button } from "@heroui/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { FileSpreadsheet, List, Plus, Table } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { CategoriesModal } from "./components/categories-modal";
import { CategoryTotalsCard } from "./components/category-totals-card";
import { CsvImportModal } from "./components/csv-import-modal";
import { TransactionFilters } from "./components/transaction-filters";
import { TransactionListTimeline } from "./components/transaction-list-timeline";
import { TransactionModal } from "./components/transaction-modal";
import { TransactionTable } from "./components/transaction-table";
import "dayjs/locale/it";

dayjs.locale("it");

type SortField = "date" | "description" | "category" | "type" | "amount";
type ViewMode = "timeline" | "table";
type FilterType = "" | "expense" | "income";

type RawTransaction = {
  id: string;
  userId: string;
  categoryId: string | null;
  description: string | null;
  type: string;
  amount: string;
  amountNok: string;
  amountEur: string;
  currency: string;
  date: Date;
  payerName: string | null;
  payerEmail: string | null;
  sharedInfo: {
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
};

type NormalizedTransaction = RawTransaction & {
  type: "expense" | "income";
};

function normalizeTransaction(t: RawTransaction): NormalizedTransaction {
  return { ...t, type: t.type as "expense" | "income" };
}

function groupByDate(
  txList: NormalizedTransaction[],
): { date: string; list: NormalizedTransaction[] }[] {
  const groups: Record<string, NormalizedTransaction[]> = {};
  for (const t of txList) {
    const key = dayjs(t.date).format("D MMMM YYYY");
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return Object.keys(groups).map((date) => ({ date, list: groups[date] }));
}

function computeCategoryTotals(
  txList: NormalizedTransaction[],
  categories: { id: string; name: string; icon: string; color: string }[],
) {
  const sums: Record<
    string,
    {
      amountEur: number;
      count: number;
      color: string;
      icon: string;
      name: string;
    }
  > = {};

  for (const t of txList) {
    if (t.type !== "expense") continue;
    const catId = t.categoryId || "general";
    const cat = categories.find((c) => c.id === t.categoryId);

    if (!sums[catId]) {
      sums[catId] = {
        amountEur: 0,
        count: 0,
        color: cat?.color ?? "#8E8E93",
        icon: cat?.icon ?? "Sparkles",
        name: cat?.name ?? "Generale",
      };
    }
    sums[catId].amountEur += parseFloat(t.amountEur);
    sums[catId].count += 1;
  }

  return Object.values(sums).sort((a, b) => b.amountEur - a.amountEur);
}

export default function TransactionsView() {
  const { displayCurrency, convertCurrency, rates } = useDashboard();

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeMobileTab, setActiveMobileTab] = useState<
    "list" | "summary" | "filters"
  >("list");
  const [filterText, setFilterText] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCatManageOpen, setIsCatManageOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  const filterInput = {
    search: filterText || undefined,
    categoryId: filterCategoryId || undefined,
    type: (filterType || undefined) as "expense" | "income" | undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  };

  const categoriesQuery = trpc.category.list.useQuery();
  const friendsQuery = trpc.friend.listFriends.useQuery();

  const transactionsQuery = trpc.transaction.list.useQuery(filterInput);

  const paginatedQuery = trpc.transaction.listPaginated.useQuery(
    { ...filterInput, page: currentPage, limit: 10, sortField, sortDirection },
    { enabled: viewMode === "table" },
  );

  const utils = trpc.useUtils();

  const invalidateTransactions = () => {
    utils.transaction.list.invalidate();
    utils.transaction.listPaginated.invalidate();
  };

  const createCategoryMutation = trpc.category.create.useMutation({
    onSuccess: () => categoriesQuery.refetch(),
  });
  const deleteCategoryMutation = trpc.category.delete.useMutation({
    onSuccess: () => categoriesQuery.refetch(),
  });
  const createTransactionMutation = trpc.transaction.create.useMutation({
    onSuccess: invalidateTransactions,
  });
  const createManyTransactionsMutation =
    trpc.transaction.createMany.useMutation({
      onSuccess: invalidateTransactions,
    });
  const deleteTransactionMutation = trpc.transaction.delete.useMutation({
    onSuccess: invalidateTransactions,
  });

  if (
    categoriesQuery.isLoading ||
    friendsQuery.isLoading ||
    transactionsQuery.isLoading
  ) {
    return <LoadingState />;
  }

  const categories = categoriesQuery.data ?? [];
  const rawTransactions = transactionsQuery.data ?? [];
  const transactions = rawTransactions.map(normalizeTransaction);
  const groupedTx = groupByDate(transactions);
  const categoryTotals = computeCategoryTotals(transactions, categories);
  const paginatedTxList = (paginatedQuery.data?.items ?? []).map(
    normalizeTransaction,
  );

  const resetPage = () => setCurrentPage(1);

  const handleFilterText = (v: string) => {
    setFilterText(v);
    resetPage();
  };
  const handleFilterCategory = (v: string) => {
    setFilterCategoryId(v);
    resetPage();
  };
  const handleFilterType = (v: FilterType) => {
    setFilterType(v);
    resetPage();
  };
  const handleFilterStart = (v: string) => {
    setFilterStartDate(v);
    resetPage();
  };
  const handleFilterEnd = (v: string) => {
    setFilterEndDate(v);
    resetPage();
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    resetPage();
  };

  const handleCreateTx = async (tx: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => {
    await createTransactionMutation.mutateAsync({
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      exchangeRate: rates[tx.currency] ?? 1,
      exchangeRateNok: rates.NOK ?? 11.85,
      categoryId: tx.categoryId,
      date: tx.date,
      sharedWithUserId: null,
    });
  };

  const handleCreateCategory = async (cat: {
    name: string;
    icon: string;
    color: string;
  }) => {
    const res = await createCategoryMutation.mutateAsync(cat);
    return { id: res.id };
  };

  const handleCsvImport = async (
    rows: {
      type: "expense" | "income";
      amount: number;
      currency: string;
      exchangeRate: number;
      exchangeRateNok: number;
      description: string;
      categoryId: string | null;
      date: string;
    }[],
  ) => {
    await createManyTransactionsMutation.mutateAsync(
      rows.map((r) => ({
        type: r.type,
        amount: r.amount,
        currency: r.currency,
        exchangeRate: r.exchangeRate,
        exchangeRateNok: r.exchangeRateNok,
        description: r.description,
        categoryId: r.categoryId,
        date: r.date,
      })),
    );
  };

  const handleDeleteTxConfirm = async () => {
    if (!txToDelete) return;
    await deleteTransactionMutation.mutateAsync({ id: txToDelete });
    setTxToDelete(null);
  };

  const handleDeleteCatConfirm = async () => {
    if (!catToDelete) return;
    await deleteCategoryMutation.mutateAsync({ id: catToDelete });
    setCatToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-row justify-between items-center gap-4 select-none mb-4 w-full"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider hidden md:inline">
            Gestione Spese
          </span>
          <h2 className="text-lg md:text-2xl font-black tracking-tight">
            Transazioni
          </h2>
          <p className="text-[var(--text-muted)] text-xs hidden md:block">
            Visualizza, filtra o importa le tue spese ed entrate
          </p>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            className="font-bold text-xs bg-blue-500 text-white border-0 hover:opacity-90 rounded-xl h-9 md:h-10 px-2.5 md:px-4 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
            onPress={() => setIsTxModalOpen(true)}
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Nuova Transazione</span>
            <span className="sm:hidden">Nuova</span>
          </Button>

          <Button
            variant="outline"
            className="font-semibold text-xs border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl h-9 md:h-10 px-2.5 md:px-3 flex items-center justify-center gap-1.5 cursor-pointer text-[var(--foreground)] bg-[var(--card)]"
            onPress={() => setIsCsvModalOpen(true)}
          >
            <FileSpreadsheet size={13} className="text-emerald-500" />
            <span className="hidden sm:inline">Importa CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>

          <Button
            variant="outline"
            className="font-semibold text-xs border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl h-9 md:h-10 px-2.5 md:px-3 flex items-center justify-center gap-1.5 cursor-pointer text-[var(--foreground)] bg-[var(--card)]"
            onPress={() => setIsCatManageOpen(true)}
          >
            <span className="hidden sm:inline">Gestisci Categorie</span>
            <span className="sm:hidden">Categorie</span>
          </Button>
        </div>
      </motion.div>

      <div className="flex lg:hidden rounded-[1.25rem] bg-neutral-500/5 dark:bg-zinc-800/20 border border-[var(--card-border)] p-1 w-full flex-shrink-0 select-none">
        <button
          type="button"
          onClick={() => setActiveMobileTab("list")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
            activeMobileTab === "list"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
          )}
        >
          Transazioni
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("summary")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
            activeMobileTab === "summary"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
          )}
        >
          Riepilogo
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("filters")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent flex items-center justify-center gap-1",
            activeMobileTab === "filters"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
          )}
        >
          Filtri
          {(filterText ||
            filterCategoryId ||
            filterType ||
            filterStartDate ||
            filterEndDate) && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          )}
        </button>
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(activeMobileTab !== "filters" && "hidden lg:block")}
      >
        <TransactionFilters
          filterText={filterText}
          setFilterText={handleFilterText}
          filterCategoryId={filterCategoryId}
          setFilterCategoryId={handleFilterCategory}
          filterType={filterType}
          setFilterType={handleFilterType}
          filterStartDate={filterStartDate}
          setFilterStartDate={handleFilterStart}
          filterEndDate={filterEndDate}
          setFilterEndDate={handleFilterEnd}
          categories={categories}
        />
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "flex bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-1 shadow-sm max-w-[240px] select-none",
          activeMobileTab !== "list" && "hidden lg:flex",
        )}
      >
        {(["timeline", "table"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 bg-transparent",
              viewMode === mode
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                : "text-[var(--text-muted)] hover:bg-neutral-500/10 hover:text-[var(--foreground)]",
            )}
          >
            {mode === "timeline" ? <List size={13} /> : <Table size={13} />}
            {mode === "timeline" ? "Timeline" : "Tabella"}
          </button>
        ))}
      </motion.div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "lg:col-span-3 flex flex-col gap-6",
            activeMobileTab !== "list" && "hidden lg:flex",
          )}
        >
          {viewMode === "timeline" ? (
            <TransactionListTimeline
              groupedTx={groupedTx}
              categories={categories}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
              onDeleteClick={setTxToDelete}
            />
          ) : (
            <TransactionTable
              transactions={paginatedTxList}
              totalItems={paginatedQuery.data?.totalCount ?? 0}
              currentPage={currentPage}
              onChangePage={setCurrentPage}
              categories={categories}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              onDeleteClick={setTxToDelete}
            />
          )}
        </motion.div>

        <motion.div
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
        </motion.div>
      </div>

      {}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        categories={categories}
        onSave={handleCreateTx}
        onCreateCategory={handleCreateCategory}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        categories={categories}
        onImport={handleCsvImport}
      />

      <CategoriesModal
        isOpen={isCatManageOpen}
        onClose={() => setIsCatManageOpen(false)}
        categories={categories}
        onDeleteCategory={setCatToDelete}
        onCreateCategory={async (cat) => {
          await handleCreateCategory(cat);
        }}
      />

      <ConfirmationDialog
        isOpen={txToDelete !== null}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleDeleteTxConfirm}
        title="Elimina Transazione"
        message="Sei sicuro di voler eliminare questa transazione? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />

      <ConfirmationDialog
        isOpen={catToDelete !== null}
        onClose={() => setCatToDelete(null)}
        onConfirm={handleDeleteCatConfirm}
        title="Elimina Categoria"
        message="Sei sicuro di voler eliminare questa categoria? Le transazioni collegate rimarranno ma diventeranno senza categoria."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />
    </div>
  );
}
