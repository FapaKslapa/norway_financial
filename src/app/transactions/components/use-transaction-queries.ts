import { useQuery } from "@tanstack/react-query";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import {
  computeCategoryTotals,
  groupByDate,
  normalizeTransaction,
  type ViewMode,
  type SortField,
} from "./transactions-utils";
import { type FilterInput } from "./use-transaction-filters";

export function useTransactionQueries({
  filterInput,
  currentPage,
  viewMode,
  sortField,
  sortDirection,
}: {
  filterInput: FilterInput;
  currentPage: number;
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: "asc" | "desc";
}) {
  const { displayCurrency, convertCurrency } = useDashboard();
  const trpc = useTRPC();

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useQuery(trpc.category.list.queryOptions());

  const { isLoading: isFriendsLoading } = useQuery(
    trpc.friend.listFriends.queryOptions(),
  );

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery(
    trpc.transaction.list.queryOptions(filterInput),
  );

  const { data: paginatedData } = useQuery(
    trpc.transaction.listPaginated.queryOptions(
      {
        ...filterInput,
        page: currentPage,
        limit: 10,
        sortField,
        sortDirection,
      },
      { enabled: viewMode === "table" },
    ),
  );

  const isLoading =
    isCategoriesLoading || isFriendsLoading || isTransactionsLoading;

  const categories = categoriesData ?? [];
  const transactions = (transactionsData ?? []).map(normalizeTransaction);
  const groupedTx = groupByDate(transactions);
  const categoryTotals = computeCategoryTotals(transactions, categories);
  const paginatedTxList = (paginatedData?.items ?? []).map(normalizeTransaction);
  const totalItems = paginatedData?.totalCount ?? 0;

  return {
    isLoading,
    refetchCategories,
    categories,
    groupedTx,
    categoryTotals,
    paginatedTxList,
    totalItems,
    displayCurrency,
    convertCurrency,
  };
}
