"use client";

import { Button } from "@heroui/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { FileSpreadsheet, List, Plus, Table } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../../components/dashboard-layout";
import { ConfirmationDialog } from "../../components/ui/confirmation-dialog";
import { LoadingState } from "../../components/ui/loading-state";
import { trpc } from "../../lib/trpc/client";
import { cn } from "../../lib/utils";
import { CategoriesModal } from "./components/categories-modal";
import { CategoryTotalsCard } from "./components/category-totals-card";
import { CsvImportModal } from "./components/csv-import-modal";
import { TransactionFilters } from "./components/transaction-filters";
import { TransactionListTimeline } from "./components/transaction-list-timeline";
import { TransactionModal } from "./components/transaction-modal";
import { TransactionTable } from "./components/transaction-table";
import "dayjs/locale/it";

dayjs.locale("it");

type SortFieldType = "date" | "description" | "category" | "type" | "amount";

export default function TransactionsView() {
  const { displayCurrency, exchangeRate } = useDashboard();

  const categoriesQuery = trpc.category.list.useQuery();
  const transactionsQuery = trpc.transaction.list.useQuery();
  const friendsQuery = trpc.friend.listFriends.useQuery();

  const createCategoryMutation = trpc.category.create.useMutation({
    onSuccess: () => categoriesQuery.refetch(),
  });
  const deleteCategoryMutation = trpc.category.delete.useMutation({
    onSuccess: () => categoriesQuery.refetch(),
  });
  const createTransactionMutation = trpc.transaction.create.useMutation({
    onSuccess: () => transactionsQuery.refetch(),
  });
  const createManyTransactionsMutation =
    trpc.transaction.createMany.useMutation({
      onSuccess: () => transactionsQuery.refetch(),
    });
  const deleteTransactionMutation = trpc.transaction.delete.useMutation({
    onSuccess: () => transactionsQuery.refetch(),
  });

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCatManageOpen, setIsCatManageOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [sortField, setSortField] = useState<SortFieldType>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [filterText, setFilterText] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterType, setFilterType] = useState<"" | "expense" | "income">("");

  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  if (
    categoriesQuery.isLoading ||
    transactionsQuery.isLoading ||
    friendsQuery.isLoading
  ) {
    return <LoadingState />;
  }

  const handleDeleteTxConfirm = async () => {
    if (txToDelete) {
      await deleteTransactionMutation.mutateAsync({ id: txToDelete });
      setTxToDelete(null);
    }
  };

  const handleDeleteCatConfirm = async () => {
    if (catToDelete) {
      await deleteCategoryMutation.mutateAsync({ id: catToDelete });
      setCatToDelete(null);
    }
  };

  const handleCreateTx = async (tx: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: "EUR" | "NOK";
    categoryId: string | null;
    date: string;
    sharedWithUserId: string | null;
  }) => {
    await createTransactionMutation.mutateAsync({
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      exchangeRate,
      categoryId: tx.categoryId,
      date: tx.date,
      sharedWithUserId: tx.sharedWithUserId,
    });
  };

  const handleCreateCategory = async (cat: {
    name: string;
    icon: string;
    color: string;
  }) => {
    const res = await createCategoryMutation.mutateAsync({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
    });
    return { id: res.id };
  };

  const handleCsvImport = async (
    rows: {
      type: "expense" | "income";
      amount: number;
      currency: "EUR" | "NOK";
      exchangeRate: number;
      description: string;
      categoryId: string | null;
      date: string;
    }[],
  ) => {
    await createManyTransactionsMutation.mutateAsync(rows);
  };

  const getFilteredTransactions = () => {
    const raw = transactionsQuery.data || [];
    let filtered = raw.map((t) => ({
      ...t,
      type: t.type as "expense" | "income",
      currency: t.currency as "EUR" | "NOK",
    }));

    if (filterText) {
      filtered = filtered.filter(
        (t) =>
          (t.description?.toLowerCase() ?? "").includes(
            filterText.toLowerCase(),
          ) || t.amount.includes(filterText),
      );
    }

    if (filterCategoryId) {
      filtered = filtered.filter((t) => t.categoryId === filterCategoryId);
    }

    if (filterType) {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterStartDate) {
      filtered = filtered.filter((t) => {
        const txYmd = dayjs(t.date).format("YYYY-MM-DD");
        return txYmd >= filterStartDate;
      });
    }

    if (filterEndDate) {
      filtered = filtered.filter((t) => {
        const txYmd = dayjs(t.date).format("YYYY-MM-DD");
        return txYmd <= filterEndDate;
      });
    }

    return filtered;
  };

  const getSortedTransactions = (
    list: ReturnType<typeof getFilteredTransactions>,
  ) => {
    const sorted = [...list];

    sorted.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (sortField) {
        case "date":
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
          break;
        case "description":
          valA = (a.description || "").toLowerCase();
          valB = (b.description || "").toLowerCase();
          break;
        case "category": {
          const catA = (categoriesQuery.data || []).find(
            (c) => c.id === a.categoryId,
          );
          const catB = (categoriesQuery.data || []).find(
            (c) => c.id === b.categoryId,
          );
          valA = (catA?.name || "Generale").toLowerCase();
          valB = (catB?.name || "Generale").toLowerCase();
          break;
        }
        case "type":
          valA = a.type;
          valB = b.type;
          break;
        case "amount":
          valA = parseFloat(a.amountNok);
          valB = parseFloat(b.amountNok);
          break;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const getGroupedFilteredTransactions = () => {
    const filtered = getFilteredTransactions();

    const sortedByDate = [...filtered].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const groups: Record<string, typeof filtered> = {};
    for (const t of sortedByDate) {
      const dateStr = dayjs(t.date).format("D MMMM YYYY");
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(t);
    }

    return Object.keys(groups).map((date) => ({
      date,
      list: groups[date],
    }));
  };

  const getCategoryTotals = (
    filteredList: ReturnType<typeof getFilteredTransactions>,
  ) => {
    const sums: Record<
      string,
      {
        nok: number;
        eur: number;
        count: number;
        color: string;
        icon: string;
        name: string;
      }
    > = {};

    for (const t of filteredList) {
      if (t.type !== "expense") continue;
      const catId = t.categoryId || "general";
      const cat = (categoriesQuery.data || []).find(
        (c) => c.id === t.categoryId,
      );

      const amountNok = parseFloat(t.amountNok);
      const amountEur = parseFloat(t.amountEur);

      if (!sums[catId]) {
        sums[catId] = {
          nok: 0,
          eur: 0,
          count: 0,
          color: cat ? cat.color : "#8E8E93",
          icon: cat ? cat.icon : "Sparkles",
          name: cat ? cat.name : "Generale",
        };
      }

      sums[catId].nok += amountNok;
      sums[catId].eur += amountEur;
      sums[catId].count += 1;
    }

    return Object.values(sums).sort((a, b) => b.nok - a.nok);
  };

  const filteredTx = getFilteredTransactions();
  const sortedTx = getSortedTransactions(filteredTx);
  const groupedTx = getGroupedFilteredTransactions();
  const categoryTotals = getCategoryTotals(filteredTx);

  const handleSortChange = (field: SortFieldType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-between items-end flex-wrap gap-4 select-none"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
            Gestione Spese
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Registro Transazioni
          </h2>
          <p className="text-[var(--text-muted)] text-xs">
            Visualizza, filtra o importa le tue spese ed entrate
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="font-bold text-xs bg-blue-500 text-white border-0 hover:opacity-90 rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer shadow-sm"
            onPress={() => setIsTxModalOpen(true)}
          >
            <Plus size={14} /> Nuova Transazione
          </Button>

          <Button
            variant="outline"
            className="font-semibold text-xs border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl px-3 py-2 flex items-center gap-1.5 cursor-pointer text-[var(--foreground)] bg-[var(--card)]"
            onPress={() => setIsCsvModalOpen(true)}
          >
            <FileSpreadsheet size={14} className="text-emerald-500" /> Importa
            CSV
          </Button>

          <Button
            variant="outline"
            className="font-semibold text-xs border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl px-3 py-2 flex items-center gap-1.5 cursor-pointer text-[var(--foreground)] bg-[var(--card)]"
            onPress={() => setIsCatManageOpen(true)}
          >
            Categorie
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <TransactionFilters
          filterText={filterText}
          setFilterText={setFilterText}
          filterCategoryId={filterCategoryId}
          setFilterCategoryId={setFilterCategoryId}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          categories={categoriesQuery.data || []}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-1 shadow-sm max-w-[240px] select-none"
      >
        <button
          type="button"
          onClick={() => setViewMode("timeline")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 bg-transparent",
            viewMode === "timeline"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--text-muted)] hover:bg-neutral-500/10 hover:text-[var(--foreground)]",
          )}
        >
          <List size={13} /> Timeline
        </button>
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 bg-transparent",
            viewMode === "table"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--text-muted)] hover:bg-neutral-500/10 hover:text-[var(--foreground)]",
          )}
        >
          <Table size={13} /> Tabella
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-3 flex flex-col gap-6"
        >
          {viewMode === "timeline" ? (
            <TransactionListTimeline
              groupedTx={groupedTx}
              categories={categoriesQuery.data || []}
              displayCurrency={displayCurrency}
              exchangeRate={exchangeRate}
              onDeleteClick={setTxToDelete}
            />
          ) : (
            <TransactionTable
              sortedTx={sortedTx}
              categories={categoriesQuery.data || []}
              displayCurrency={displayCurrency}
              exchangeRate={exchangeRate}
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
          className="lg:col-span-1"
        >
          <CategoryTotalsCard
            categoryTotals={categoryTotals}
            displayCurrency={displayCurrency}
          />
        </motion.div>
      </div>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        categories={categoriesQuery.data || []}
        friends={friendsQuery.data || []}
        exchangeRate={exchangeRate}
        onSave={handleCreateTx}
        onCreateCategory={handleCreateCategory}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        categories={categoriesQuery.data || []}
        exchangeRate={exchangeRate}
        onImport={handleCsvImport}
      />

      <CategoriesModal
        isOpen={isCatManageOpen}
        onClose={() => setIsCatManageOpen(false)}
        categories={categoriesQuery.data || []}
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
