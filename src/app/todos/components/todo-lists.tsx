"use client";

import { FolderOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TodoList = {
  id: string;
  name: string;
  activeCount?: number;
};

type TodoListsProps = {
  lists: TodoList[];
  activeListId: string;
  onSelectActiveList: (id: string) => void;
  onDeleteList: (id: string) => void;
};

export function TodoLists({
  lists,
  activeListId,
  onSelectActiveList,
  onDeleteList,
}: TodoListsProps) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider pl-1">
        Le mie Liste
      </h4>

      <div className="flex flex-col gap-2">
        {lists.map((list) => {
          const isActive = list.id === activeListId;
          const count = list.activeCount ?? 0;
          return (
            <div
              key={list.id}
              className={cn(
                "group relative flex justify-between items-center px-4 py-3.5 rounded-2xl border transition-all select-none",
                isActive
                  ? "bg-blue-500 text-white border-transparent shadow-md shadow-blue-500/15"
                  : "bg-[var(--card)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-neutral-500/10",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectActiveList(list.id)}
                className="absolute inset-0 rounded-2xl border-0 bg-transparent cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                aria-label={list.name}
              />

              <div className="relative z-10 flex items-center gap-2.5 min-w-0 flex-1 pointer-events-none">
                <FolderOpen
                  size={15}
                  className={isActive ? "text-white" : "text-blue-500"}
                />
                <span className="text-xs font-bold truncate">{list.name}</span>
              </div>

              <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
                {count > 0 && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-black rounded-full transition-colors",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-500/10 text-blue-500",
                    )}
                  >
                    {count}
                  </span>
                )}

                {lists.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteList(list.id)}
                    className={cn(
                      "p-1 rounded-lg transition-all border-0 bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center h-6 w-6",
                      isActive
                        ? "text-white/70 hover:bg-white/10"
                        : "text-rose-500 hover:bg-rose-500/10",
                    )}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
