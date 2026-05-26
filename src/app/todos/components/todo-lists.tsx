"use client";

import { FolderOpen, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";

type TodoList = {
  id: string;
  name: string;
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

      <div className="flex flex-col gap-1.5">
        {lists.map((list) => {
          const isActive = list.id === activeListId;
          return (
            <button
              type="button"
              key={list.id}
              className={cn(
                "flex justify-between items-center px-3.5 py-3 rounded-2xl border transition-all cursor-pointer select-none text-left w-full bg-transparent outline-none",
                isActive
                  ? "bg-[var(--foreground)] text-[var(--background)] border-transparent shadow-md"
                  : "bg-[var(--card)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-neutral-500/10",
              )}
              onClick={() => onSelectActiveList(list.id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FolderOpen
                  size={14}
                  className={
                    isActive ? "text-[var(--background)]" : "text-blue-500"
                  }
                />
                <span className="text-xs font-bold truncate">{list.name}</span>
              </div>

              {lists.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList(list.id);
                  }}
                  className={cn(
                    "p-1 rounded-lg hover:bg-neutral-500/20 transition-all border-0 bg-transparent cursor-pointer ml-2",
                    isActive ? "text-[var(--background)]/60" : "text-rose-500",
                  )}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
