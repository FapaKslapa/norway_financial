import { useState } from "react";
import { type FilterType } from "./transactions-utils";

export type FilterInput = {
  search?: string;
  categoryId?: string;
  type?: "expense" | "income";
  startDate?: string;
  endDate?: string;
};

export function useTransactionFilters(onPageReset: () => void) {
  const [filterText, setFilterText] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const filterInput: FilterInput = {
    search: filterText || undefined,
    categoryId: filterCategoryId || undefined,
    type: (filterType || undefined) as "expense" | "income" | undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  };

  const hasActiveFilters = !!(
    filterText ||
    filterCategoryId ||
    filterType ||
    filterStartDate ||
    filterEndDate
  );

  const handleFilterText = (v: string) => {
    setFilterText(v);
    onPageReset();
  };

  const handleFilterCategory = (v: string) => {
    setFilterCategoryId(v);
    onPageReset();
  };

  const handleFilterType = (v: FilterType) => {
    setFilterType(v);
    onPageReset();
  };

  const handleFilterStart = (v: string) => {
    setFilterStartDate(v);
    onPageReset();
  };

  const handleFilterEnd = (v: string) => {
    setFilterEndDate(v);
    onPageReset();
  };

  return {
    filterText,
    filterCategoryId,
    filterType,
    filterStartDate,
    filterEndDate,
    filterInput,
    hasActiveFilters,
    handleFilterText,
    handleFilterCategory,
    handleFilterType,
    handleFilterStart,
    handleFilterEnd,
  };
}
