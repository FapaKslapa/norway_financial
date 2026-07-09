"use client";

import { cn } from "@/lib/utils";

type TodoMobileTabSwitcherProps = {
  activeTab: "active" | "completed";
  setActiveTab: (tab: "active" | "completed") => void;
  activeCount: number;
  completedCount: number;
};

export function TodoMobileTabSwitcher({
  activeTab,
  setActiveTab,
  activeCount,
  completedCount,
}: TodoMobileTabSwitcherProps) {
  return (
    <div className="flex md:hidden rounded-[1.25rem] bg-neutral-500/5 dark:bg-zinc-800/20 border border-(--card-border) p-1 w-full shrink-0 select-none mb-2">
      <button
        type="button"
        onClick={() => setActiveTab("active")}
        className={cn(
          "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
          activeTab === "active"
            ? "bg-foreground text-background shadow-sm"
            : "text-(--text-muted) hover:text-foreground",
        )}
      >
        Da Acquistare ({activeCount})
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("completed")}
        className={cn(
          "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
          activeTab === "completed"
            ? "bg-foreground text-background shadow-sm"
            : "text-(--text-muted) hover:text-foreground",
        )}
      >
        Completati ({completedCount})
      </button>
    </div>
  );
}
