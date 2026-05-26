"use client";

import { Button, InputGroup } from "@heroui/react";
import { Search, X } from "lucide-react";
import { CustomDatePicker } from "../../../components/ui/custom-datepicker";
import { CustomSelect } from "../../../components/ui/custom-select";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type TransactionFiltersProps = {
  filterText: string;
  setFilterText: (v: string) => void;
  filterCategoryId: string;
  setFilterCategoryId: (v: string) => void;
  filterType: "" | "expense" | "income";
  setFilterType: (v: "" | "expense" | "income") => void;
  filterStartDate: string;
  setFilterStartDate: (v: string) => void;
  filterEndDate: string;
  setFilterEndDate: (v: string) => void;
  categories: Category[];
};

export function TransactionFilters({
  filterText,
  setFilterText,
  filterCategoryId,
  setFilterCategoryId,
  filterType,
  setFilterType,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  categories,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    filterText ||
    filterCategoryId ||
    filterType ||
    filterStartDate ||
    filterEndDate;

  const handleResetFilters = () => {
    setFilterText("");
    setFilterCategoryId("");
    setFilterType("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  return (
    <div className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 apple-widget transition-all select-none overflow-visible relative z-20 flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 w-full">
        <div className="flex-1 min-w-[200px]">
          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
            Cerca
          </span>
          <InputGroup className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-9 px-2.5 rounded-xl flex items-center border-0 w-full mt-1 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
            <Search
              size={13}
              className="text-neutral-500 mr-1.5 flex-shrink-0"
            />
            <InputGroup.Input
              type="text"
              placeholder="Cerca descrizione o importo..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full"
            />
            {filterText && (
              <InputGroup.Suffix className="flex items-center">
                <X
                  size={12}
                  className="cursor-pointer text-neutral-500"
                  onClick={() => setFilterText("")}
                />
              </InputGroup.Suffix>
            )}
          </InputGroup>
        </div>

        <div className="min-w-[150px]">
          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
            Categoria
          </span>
          <div className="mt-1">
            <CustomSelect
              value={filterCategoryId}
              onChange={setFilterCategoryId}
              placeholder="Tutte le categorie"
              triggerClassName="h-9"
              options={[
                { value: "", label: "Tutte le categorie" },
                ...categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                  color: c.color,
                })),
              ]}
            />
          </div>
        </div>

        <div className="min-w-[120px]">
          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
            Tipo
          </span>
          <div className="mt-1">
            <CustomSelect
              value={filterType}
              onChange={(val: string) =>
                setFilterType(val as "" | "expense" | "income")
              }
              placeholder="Spese & Guadagni"
              triggerClassName="h-9"
              options={[
                { value: "", label: "Spese & Guadagni" },
                { value: "expense", label: "Solo Spese" },
                { value: "income", label: "Solo Guadagni" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 w-full border-t border-[var(--card-border)] pt-3">
        <div className="flex-1 min-w-[140px]">
          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
            Da data (Dal)
          </span>
          <div className="mt-1">
            <CustomDatePicker
              value={filterStartDate}
              onChange={setFilterStartDate}
              triggerClassName="h-9"
            />
          </div>
        </div>

        <div className="flex-1 min-w-[140px]">
          <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
            A data (Al)
          </span>
          <div className="mt-1">
            <CustomDatePicker
              value={filterEndDate}
              onChange={setFilterEndDate}
              triggerClassName="h-9"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="text-rose-500 hover:bg-rose-500/10 text-xs font-bold rounded-xl h-9 px-3 cursor-pointer flex items-center gap-1 border-0"
            onPress={handleResetFilters}
          >
            <X size={12} /> Cancella Filtri
          </Button>
        )}
      </div>
    </div>
  );
}
