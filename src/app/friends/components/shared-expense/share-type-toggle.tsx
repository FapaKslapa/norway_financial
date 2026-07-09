"use client";

import { cn } from "@/lib/utils";

type Props = {
  shareType: "friend" | "group";
  onSelectFriend: () => void;
  onSelectGroup: () => void;
};

export function ShareTypeToggle({
  shareType,
  onSelectFriend,
  onSelectGroup,
}: Props) {
  return (
    <div className="flex rounded-xl bg-neutral-100 dark:bg-zinc-800/30 p-1 w-full select-none">
      <button
        type="button"
        onClick={onSelectFriend}
        className={cn(
          "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer bg-transparent",
          shareType === "friend"
            ? "bg-foreground text-background shadow-sm"
            : "text-(--text-muted)",
        )}
      >
        Singolo Amico
      </button>
      <button
        type="button"
        onClick={onSelectGroup}
        className={cn(
          "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer bg-transparent",
          shareType === "group"
            ? "bg-foreground text-background shadow-sm"
            : "text-(--text-muted)",
        )}
      >
        Gruppo / Cartella
      </button>
    </div>
  );
}
