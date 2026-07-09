import { cn } from "@/lib/utils";

type MobileTab = "list" | "summary" | "filters";

interface TransactionsMobileTabsProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasActiveFilters: boolean;
}

export function TransactionsMobileTabs({
  activeTab,
  onTabChange,
  hasActiveFilters,
}: TransactionsMobileTabsProps) {
  return (
    <div className="flex lg:hidden rounded-[1.25rem] bg-neutral-500/5 dark:bg-zinc-800/20 border border-(--card-border) p-1 w-full shrink-0 select-none">
      <button
        type="button"
        onClick={() => onTabChange("list")}
        className={cn(
          "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
          activeTab === "list"
            ? "bg-foreground text-background shadow-sm"
            : "text-(--text-muted) hover:text-foreground",
        )}
      >
        Transazioni
      </button>
      <button
        type="button"
        onClick={() => onTabChange("summary")}
        className={cn(
          "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
          activeTab === "summary"
            ? "bg-foreground text-background shadow-sm"
            : "text-(--text-muted) hover:text-foreground",
        )}
      >
        Riepilogo
      </button>
      <button
        type="button"
        onClick={() => onTabChange("filters")}
        className={cn(
          "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent flex items-center justify-center gap-1",
          activeTab === "filters"
            ? "bg-foreground text-background shadow-sm"
            : "text-(--text-muted) hover:text-foreground",
        )}
      >
        Filtri
        {hasActiveFilters && (
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        )}
      </button>
    </div>
  );
}
