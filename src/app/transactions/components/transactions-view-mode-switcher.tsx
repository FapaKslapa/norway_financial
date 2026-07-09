import { m } from "framer-motion";
import { Clock, List, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode } from "./transactions-utils";

interface TransactionsViewModeSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeMobileTab: "list" | "summary" | "filters";
}

const VIEW_MODES: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
  { mode: "timeline", label: "Timeline", icon: <List size={13} /> },
  { mode: "table", label: "Tabella", icon: <Table size={13} /> },
  { mode: "recurrent", label: "Pianificatore", icon: <Clock size={13} /> },
];

export function TransactionsViewModeSwitcher({
  viewMode,
  onViewModeChange,
  activeMobileTab,
}: TransactionsViewModeSwitcherProps) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex bg-(--card) border border-(--card-border) rounded-2xl p-1 shadow-sm max-w-[380px] select-none",
        activeMobileTab !== "list" && "hidden lg:flex",
      )}
    >
      {VIEW_MODES.map(({ mode, label, icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onViewModeChange(mode)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 bg-transparent",
            viewMode === mode
              ? "bg-foreground text-background shadow-sm"
              : "text-(--text-muted) hover:bg-neutral-500/10 hover:text-foreground",
          )}
        >
          {icon}
          {label}
        </button>
      ))}
    </m.div>
  );
}
