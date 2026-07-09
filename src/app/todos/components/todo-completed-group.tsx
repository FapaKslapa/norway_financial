"use client";

import { AnimatePresence, m } from "framer-motion";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TodoItem } from "./todo-items";

type TodoCompletedGroupProps = {
  activeTab: "active" | "completed";
  completedTodos: TodoItem[];
  onToggleTodo: (id: string, completed: boolean) => void;
  onImportTodo: (todo: TodoItem) => void;
};

export function TodoCompletedGroup({
  activeTab,
  completedTodos,
  onToggleTodo,
  onImportTodo,
}: TodoCompletedGroupProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  return (
    <div
      className={cn(
        "border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-4 rounded-3xl transition-all",
        activeTab !== "completed" && "hidden md:block",
      )}
    >
      <button
        type="button"
        onClick={() => setShowCompleted(!showCompleted)}
        className="w-full flex items-center justify-between text-left cursor-pointer border-0 bg-transparent py-1 px-1 outline-none select-none text-(--text-muted) hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
            <Check size={11} className="stroke-[3]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider">
            Articoli Completati ({completedTodos.length})
          </span>
        </div>
        <span className="hidden md:inline">
          {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {(showCompleted || activeTab === "completed") && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pt-3">
              {completedTodos.map((todoItem) => {
                return (
                  <div
                    key={todoItem.id}
                    className="flex justify-between items-center p-3 rounded-2xl border border-(--card-border) bg-neutral-500/5 dark:bg-zinc-800/5 hover:bg-neutral-500/10 dark:hover:bg-zinc-800/15 opacity-75 hover:opacity-100 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleTodo(todoItem.id, false)}
                        aria-label="Segna come da acquistare"
                        className="h-5 w-5 rounded-full bg-blue-500 border border-transparent flex items-center justify-center transition-all cursor-pointer shrink-0"
                        title="Segna come da acquistare"
                      >
                        <Check size={11} className="text-white stroke-[3]" />
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground line-through text-(--text-muted) truncate">
                          {todoItem.title}
                        </span>
                        {todoItem.notes && (
                          <p className="text-[10px] text-(--text-muted)/60 font-normal mt-0.5 line-clamp-2 line-through leading-relaxed">
                            {todoItem.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {!todoItem.convertedToTransactionId ? (
                        <button
                          type="button"
                          className="text-[9px] font-black px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white cursor-pointer select-none transition-all flex items-center gap-1 border-0"
                          onClick={() => onImportTodo(todoItem)}
                        >
                          Importa Spesa
                        </button>
                      ) : (
                        <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded-xl flex items-center gap-0.5 select-none">
                          <Check size={10} className="stroke-[3]" /> Importato
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
