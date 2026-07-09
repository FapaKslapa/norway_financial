"use client";

import { cn } from "@/lib/utils";

type ActiveMobileTab = "friends" | "groups" | "manage";

interface MobileTabBarProps {
  activeTab: ActiveMobileTab;
  onTabChange: (tab: ActiveMobileTab) => void;
  pendingCount: number;
  hidden?: boolean;
}

export function MobileTabBar({
  activeTab,
  onTabChange,
  pendingCount,
  hidden,
}: MobileTabBarProps) {
  return (
    <div
      className={cn(
        "flex md:hidden rounded-[1.25rem] bg-neutral-500/5 dark:bg-zinc-800/20 border border-(--card-border) p-1 w-full shrink-0 select-none",
        hidden && "hidden",
      )}
    >
      {(["friends", "groups", "manage"] as ActiveMobileTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent flex items-center justify-center gap-1",
            activeTab === tab
              ? "bg-foreground text-background shadow-sm"
              : "text-(--text-muted) hover:text-foreground",
          )}
        >
          {tab === "friends" && "Amici"}
          {tab === "groups" && "Gruppi"}
          {tab === "manage" && (
            <>
              Gestisci
              {pendingCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </>
          )}
        </button>
      ))}
    </div>
  );
}
