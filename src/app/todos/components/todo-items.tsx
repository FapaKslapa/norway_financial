"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { cn, formatCurrency } from "@/lib/utils";

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
  isSelectionMode: boolean;
  selectedTodoIds: string[];
  onToggleSelectTodo: (id: string) => void;
  onToggleAllSelectTodos: (selected: boolean) => void;
  onStartSelectionMode: () => void;
  onCancelSelectionMode: () => void;
  onTriggerBulkImport: () => void;
};

export function TodoItems({
  todos,
  categories,
  onToggleTodo,
  onDeleteTodo,
  onImportTodo,
  isSelectionMode,
  selectedTodoIds,
  onToggleSelectTodo,
  onToggleAllSelectTodos,
  onStartSelectionMode,
  onCancelSelectionMode,
  onTriggerBulkImport,
}: TodoItemsProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex md:hidden rounded-[1.25rem] bg-neutral-500/5 dark:bg-zinc-800/20 border border-[var(--card-border)] p-1 w-full flex-shrink-0 select-none mb-2">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
            activeTab === "active"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
          )}
        >
          Da Acquistare ({activeTodos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
            activeTab === "completed"
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
          )}
        >
          Completati ({completedTodos.length})
        </button>
      </div>

      <div
        className={cn(
          "border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 rounded-3xl transition-all",
          activeTab !== "active" && "hidden md:block",
        )}
      >
        <div className="flex flex-row items-center justify-between pb-3 border-b border-[var(--card-border)] mb-4 gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <span className="hidden sm:inline">Articoli da Acquistare</span>
              <span className="sm:hidden">Da Acquistare</span> (
              {activeTodos.length})
            </span>
          </div>

          {activeTodos.length > 0 && (
            <div className="flex items-center gap-1.5 self-center">
              {isSelectionMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = activeTodos.every((t) =>
                        selectedTodoIds.includes(t.id),
                      );
                      onToggleAllSelectTodos(!allSelected);
                    }}
                    className="text-[10px] font-bold px-2 py-1 rounded-xl border border-[var(--card-border)] bg-neutral-500/5 hover:bg-neutral-500/10 cursor-pointer transition-all"
                  >
                    {activeTodos.every((t) =>
                      selectedTodoIds.includes(t.id),
                    ) ? (
                      <>
                        <span className="hidden sm:inline">
                          Deseleziona Tutti
                        </span>
                        <span className="sm:hidden">Nessuno</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          Seleziona Tutti
                        </span>
                        <span className="sm:hidden">Tutti</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onTriggerBulkImport}
                    disabled={selectedTodoIds.length === 0}
                    className="text-[10px] font-black px-2 py-1 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 cursor-pointer transition-all flex items-center justify-center gap-1 border-0 shadow-sm"
                  >
                    <Sparkles size={11} />
                    <span>Importa ({selectedTodoIds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={onCancelSelectionMode}
                    className="text-[10px] font-bold px-2 py-1 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer border-0 transition-all"
                  >
                    Annulla
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onStartSelectionMode}
                  className="text-[10px] font-black h-8 px-2.5 rounded-xl border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 cursor-pointer transition-all flex items-center justify-center gap-1 bg-transparent shrink-0"
                  title="Importazione di Massa"
                >
                  <Sparkles size={11} className="animate-pulse" />
                  <span className="hidden sm:inline font-bold">
                    Importazione di Massa
                  </span>
                  <span className="sm:hidden font-bold">Seleziona</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {activeTodos.map((todoItem) => {
            const estAmountNum = todoItem.estimatedAmount
              ? parseFloat(todoItem.estimatedAmount)
              : null;
            const cat = categories.find((c) => c.id === todoItem.categoryId);
            const isSelected = selectedTodoIds.includes(todoItem.id);
            return (
              // biome-ignore lint/a11y/useSemanticElements: div is used to avoid nested button elements
              <div
                key={todoItem.id}
                onClick={
                  isSelectionMode
                    ? () => onToggleSelectTodo(todoItem.id)
                    : undefined
                }
                onKeyDown={
                  isSelectionMode
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onToggleSelectTodo(todoItem.id);
                        }
                      }
                    : undefined
                }
                role="button"
                tabIndex={isSelectionMode ? 0 : -1}
                className={cn(
                  "flex justify-between items-center p-3.5 rounded-2xl border transition-all select-none group",
                  isSelectionMode && "cursor-pointer",
                  isSelectionMode && isSelected
                    ? "bg-blue-500/5 border-blue-500/30 shadow-sm"
                    : "bg-neutral-500/5 dark:bg-zinc-800/10 border-[var(--card-border)] hover:bg-neutral-500/10 dark:hover:bg-zinc-800/20",
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {isSelectionMode ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectTodo(todoItem.id);
                      }}
                      className="h-5 w-5 rounded-lg text-blue-500 hover:bg-blue-500/10 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 border-0 bg-transparent"
                      title="Seleziona"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="stroke-[2.5]" />
                      ) : (
                        <Square size={16} className="opacity-40" />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTodo(todoItem.id, true);
                      }}
                      className="h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-500/10 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 group/check"
                      title="Segna come completato"
                    >
                      <Check
                        size={11}
                        className="text-transparent group-hover/check:text-blue-500 transition-colors stroke-[3]"
                      />
                    </button>
                  )}

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

                {!isSelectionMode && (
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <button
                      type="button"
                      className="text-rose-500 hover:bg-rose-500/15 rounded-lg h-7 w-7 border-0 cursor-pointer flex items-center justify-center bg-transparent transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTodo(todoItem.id);
                      }}
                      title="Elimina"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
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

      {completedTodos.length > 0 && (
        <div
          className={cn(
            "border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-4 rounded-3xl transition-all",
            activeTab !== "completed" && "hidden md:block",
          )}
        >
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
            <span className="hidden md:inline">
              {showCompleted ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {(showCompleted || activeTab === "completed") && (
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
                            className="text-rose-500 hover:bg-rose-500/15 rounded-lg h-7 w-7 border-0 cursor-pointer flex items-center justify-center bg-transparent transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
