"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { formatCurrency } from "@/lib/utils";

export type TodoItem = {
  id: string;
  todoListId: string | null;
  title: string;
  notes: string | null;
  categoryId: string | null;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
  completed: boolean;
  convertedToTransactionId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type TodoItemsProps = {
  todos: TodoItem[];
  categories: Category[];
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  onImportTodo: (todo: TodoItem) => void;
};

export function TodoItems({
  todos,
  categories,
  onToggleTodo,
  onDeleteTodo,
  onImportTodo,
}: TodoItemsProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="flex flex-col gap-4">
      {}
      <div className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 rounded-3xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)] mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Articoli da Acquistare ({activeTodos.length})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {activeTodos.map((todoItem) => {
            const estAmountNum = todoItem.estimatedAmount
              ? parseFloat(todoItem.estimatedAmount)
              : null;
            const cat = categories.find((c) => c.id === todoItem.categoryId);
            return (
              <div
                key={todoItem.id}
                className="flex justify-between items-center p-3.5 rounded-2xl border border-[var(--card-border)] bg-neutral-500/5 dark:bg-zinc-800/10 hover:bg-neutral-500/10 dark:hover:bg-zinc-800/20 transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {}
                  <button
                    type="button"
                    onClick={() => onToggleTodo(todoItem.id, true)}
                    className="h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-500/10 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 group/check"
                    title="Segna come completato"
                  >
                    <Check
                      size={11}
                      className="text-transparent group-hover/check:text-blue-500 transition-colors stroke-[3]"
                    />
                  </button>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[var(--foreground)] truncate">
                      {todoItem.title}
                    </span>
                    {todoItem.notes && (
                      <p className="text-[10px] text-[var(--text-muted)] font-normal mt-0.5 line-clamp-2 leading-relaxed">
                        {todoItem.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {cat && (
                        <span
                          className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={9} />
                          {cat.name}
                        </span>
                      )}
                      {estAmountNum && (
                        <span className="text-[9px] text-[var(--text-muted)] font-medium select-none">
                          Stima:{" "}
                          {formatCurrency(
                            estAmountNum,
                            todoItem.estimatedCurrency || "EUR",
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    type="button"
                    className="text-rose-500 hover:bg-rose-500/15 rounded-lg h-7 w-7 border-0 cursor-pointer flex items-center justify-center bg-transparent transition-all md:opacity-0 group-hover:opacity-100"
                    onClick={() => onDeleteTodo(todoItem.id)}
                    title="Elimina"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}

          {activeTodos.length === 0 && (
            <div className="text-center py-10 text-xs text-[var(--text-muted)] font-medium">
              Nessun elemento attivo in questa lista. Aggiungine uno qui sopra!
            </div>
          )}
        </div>
      </div>

      {}
      {completedTodos.length > 0 && (
        <div className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-4 rounded-3xl transition-all">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between text-left cursor-pointer border-0 bg-transparent py-1 px-1 outline-none select-none text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                <Check size={11} className="stroke-[3]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">
                Articoli Completati ({completedTodos.length})
              </span>
            </div>
            {showCompleted ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>

          <AnimatePresence initial={false}>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2 pt-3">
                  {completedTodos.map((todoItem) => {
                    const estAmountNum = todoItem.estimatedAmount
                      ? parseFloat(todoItem.estimatedAmount)
                      : null;
                    const cat = categories.find(
                      (c) => c.id === todoItem.categoryId,
                    );
                    return (
                      <div
                        key={todoItem.id}
                        className="flex justify-between items-center p-3 rounded-2xl border border-[var(--card-border)] bg-neutral-500/5 dark:bg-zinc-800/5 hover:bg-neutral-500/10 dark:hover:bg-zinc-800/15 opacity-75 hover:opacity-100 transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {}
                          <button
                            type="button"
                            onClick={() => onToggleTodo(todoItem.id, false)}
                            className="h-5 w-5 rounded-full bg-blue-500 border border-transparent flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                            title="Segna come da acquistare"
                          >
                            <Check
                              size={11}
                              className="text-white stroke-[3]"
                            />
                          </button>

                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[var(--foreground)] line-through text-[var(--text-muted)] truncate">
                              {todoItem.title}
                            </span>
                            {todoItem.notes && (
                              <p className="text-[10px] text-[var(--text-muted)]/60 font-normal mt-0.5 line-clamp-2 line-through leading-relaxed">
                                {todoItem.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {cat && (
                                <span
                                  className="text-[8px] font-bold text-white/80 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 select-none"
                                  style={{ backgroundColor: cat.color }}
                                >
                                  <CategoryIcon name={cat.icon} size={9} />
                                  {cat.name}
                                </span>
                              )}
                              {estAmountNum && (
                                <span className="text-[9px] text-[var(--text-muted)]/70 font-medium select-none">
                                  Stima:{" "}
                                  {formatCurrency(
                                    estAmountNum,
                                    todoItem.estimatedCurrency || "EUR",
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
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
                              <Check size={10} className="stroke-[3]" />{" "}
                              Importato
                            </span>
                          )}

                          <button
                            type="button"
                            className="text-rose-500 hover:bg-rose-500/15 rounded-lg h-7 w-7 border-0 cursor-pointer flex items-center justify-center bg-transparent transition-all md:opacity-0 group-hover:opacity-100"
                            onClick={() => onDeleteTodo(todoItem.id)}
                            title="Elimina"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
