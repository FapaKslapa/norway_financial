import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { useDashboard } from "@/components/dashboard-layout";
import { type NormalizedTransaction } from "./transactions-utils";

export type SaveTxPayload = {
  id?: string;
  description: string;
  type: "expense" | "income";
  amount: number;
  currency: string;
  categoryId: string | null;
  date: string;
};

export type CsvImportRow = {
  type: "expense" | "income";
  amount: number;
  currency: string;
  exchangeRate: number;
  exchangeRateNok: number;
  description: string;
  categoryId: string | null;
  date: string;
};

export function useTransactionMutations(refetchCategories: () => void) {
  const { rates } = useDashboard();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const invalidateTransactions = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.transaction.list.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.transaction.listPaginated.queryKey(),
    });
  };

  const createCategoryMutation = useMutation(
    trpc.category.create.mutationOptions({
      onSuccess: () => refetchCategories(),
    }),
  );
  const updateCategoryMutation = useMutation(
    trpc.category.update.mutationOptions({
      onSuccess: () => refetchCategories(),
    }),
  );
  const deleteCategoryMutation = useMutation(
    trpc.category.delete.mutationOptions({
      onSuccess: () => refetchCategories(),
    }),
  );
  const createTransactionMutation = useMutation(
    trpc.transaction.create.mutationOptions({
      onSuccess: invalidateTransactions,
    }),
  );
  const updateTransactionMutation = useMutation(
    trpc.transaction.update.mutationOptions({
      onSuccess: invalidateTransactions,
    }),
  );
  const createManyTransactionsMutation = useMutation(
    trpc.transaction.createMany.mutationOptions({
      onSuccess: invalidateTransactions,
    }),
  );
  const deleteTransactionMutation = useMutation(
    trpc.transaction.delete.mutationOptions({
      onSuccess: invalidateTransactions,
    }),
  );

  const handleSaveTx = async (
    tx: SaveTxPayload,
    onDone: () => void,
  ) => {
    if (tx.id) {
      await updateTransactionMutation.mutateAsync({
        id: tx.id,
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        exchangeRate: rates[tx.currency] ?? 1,
        exchangeRateNok: rates.NOK ?? 11.85,
        categoryId: tx.categoryId,
        date: tx.date,
      });
    } else {
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
    }
    onDone();
  };

  const handleCreateCategory = async (cat: {
    name: string;
    icon: string;
    color: string;
  }) => {
    const res = await createCategoryMutation.mutateAsync(cat);
    return { id: res.id };
  };

  const handleUpdateCategory = async (cat: {
    id: string;
    name: string;
    icon: string;
    color: string;
  }) => {
    await updateCategoryMutation.mutateAsync(cat);
  };

  const handleCsvImport = async (rows: CsvImportRow[]) => {
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

  const handleDeleteTransaction = async (
    id: string,
    onDone: () => void,
  ) => {
    await deleteTransactionMutation.mutateAsync({ id });
    onDone();
  };

  const handleDeleteCategory = async (
    id: string,
    onDone: () => void,
  ) => {
    await deleteCategoryMutation.mutateAsync({ id });
    onDone();
  };

  return {
    handleSaveTx,
    handleCreateCategory,
    handleUpdateCategory,
    handleCsvImport,
    handleDeleteTransaction,
    handleDeleteCategory,
  };
}
