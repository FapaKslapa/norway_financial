"use client";

import { Check, CheckSquare, Sparkles, Square, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { cn, formatCurrency } from "@/lib/utils";
import type { TodoItem } from "./todo-items";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type TodoItemRowProps = {
  todoItem: TodoItem;
  categories: Category[];
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  onToggleSelectTodo: (id: string) => void;
};

export function TodoItemRow({
  todoItem,
  categories,
  isSelectionMode,
  isSelected,
  onToggleTodo,
  onDeleteTodo,
  onToggleSelectTodo,
}: TodoItemRowProps) {
  const estAmountNum = todoItem.estimatedAmount
    ? parseFloat(todoItem.estimatedAmount)
    : null;
  const cat = categories.find((c) => c.id === todoItem.categoryId);

  if (isSelectionMode) {
    return (
      <button
        type="button"
        onClick={() => onToggleSelectTodo(todoItem.id)}
        aria-label={todoItem.title || "Todo item"}
        className={cn(
          "flex w-full text-left justify-between items-center p-3.5 rounded-2xl border transition-all select-none group cursor-pointer bg-transparent",
          isSelected
            ? "bg-blue-500/5 border-blue-500/30 shadow-sm"
            : "bg-neutral-500/5 dark:bg-zinc-800/10 border-(--card-border) hover:bg-neutral-500/10 dark:hover:bg-zinc-800/20",
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="h-5 w-5 rounded-lg text-blue-500 flex items-center justify-center shrink-0">
            {isSelected ? (
              <CheckSquare size={16} className="stroke-[2.5]" />
            ) : (
              <Square size={16} className="opacity-40" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">
              {todoItem.title}
            </span>
            {todoItem.notes && (
              <p className="text-[10px] text-(--text-muted) font-normal mt-0.5 line-clamp-2 leading-relaxed">
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
              {!!estAmountNum && (
                <span className="text-[9px] text-(--text-muted) font-medium select-none">
                  Stima{" "}
                  {formatCurrency(
                    estAmountNum,
                    todoItem.estimatedCurrency || "EUR",
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex justify-between items-center p-3.5 rounded-2xl border transition-all select-none group bg-neutral-500/5 dark:bg-zinc-800/10 border-(--card-border) hover:bg-neutral-500/10 dark:hover:bg-zinc-800/20",
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onToggleTodo(todoItem.id, true)}
          className="h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-500/10 flex items-center justify-center transition-all cursor-pointer shrink-0 group/check"
          title="Segna come completato"
          aria-label="Segna come completato"
        >
          <Check
            size={11}
            className="text-transparent group-hover/check:text-blue-500 transition-colors stroke-[3]"
          />
        </button>

        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-foreground truncate">
            {todoItem.title}
          </span>
          {todoItem.notes && (
            <p className="text-[10px] text-(--text-muted) font-normal mt-0.5 line-clamp-2 leading-relaxed">
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
            {!!estAmountNum && (
              <span className="text-[9px] text-(--text-muted) font-medium select-none">
                Stima{" "}
                {formatCurrency(
                  estAmountNum,
                  todoItem.estimatedCurrency || "EUR",
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0">
        <button
          type="button"
          className="text-rose-500 hover:bg-rose-500/15 rounded-lg h-7 w-7 border-0 cursor-pointer flex items-center justify-center bg-transparent transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
          onClick={() => onDeleteTodo(todoItem.id)}
          title="Elimina"
          aria-label="Elimina"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

type TodoBulkActionsProps = {
  activeTodos: TodoItem[];
  selectedTodoIds: string[];
  onToggleAllSelectTodos: (selected: boolean) => void;
  onTriggerBulkImport: () => void;
  onCancelSelectionMode: () => void;
};

export function TodoBulkActions({
  activeTodos,
  selectedTodoIds,
  onToggleAllSelectTodos,
  onTriggerBulkImport,
  onCancelSelectionMode,
}: TodoBulkActionsProps) {
  const selectedTodoIdsSet = useMemo(
    () => new Set(selectedTodoIds),
    [selectedTodoIds],
  );
  const allSelected = activeTodos.every((t) => selectedTodoIdsSet.has(t.id));
  return (
    <>
      <button
        type="button"
        onClick={() => onToggleAllSelectTodos(!allSelected)}
        className="text-[10px] font-bold px-2 py-1 rounded-xl border border-(--card-border) bg-neutral-500/5 hover:bg-neutral-500/10 cursor-pointer transition-all"
      >
        {allSelected ? (
          <>
            <span className="hidden sm:inline">Deseleziona Tutti</span>
            <span className="sm:hidden">Nessuno</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Seleziona Tutti</span>
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
  );
}
