"use client";

import { ShoppingBag, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TodoBulkActions, TodoItemRow } from "./todo-item-row";
import type { Category, TodoItem } from "./todo-items";

type TodoActiveGroupProps = {
  activeTab: "active" | "completed";
  activeTodos: TodoItem[];
  categories: Category[];
  isSelectionMode: boolean;
  selectedTodoIds: string[];
  onToggleTodo: (id: string, completed: boolean) => void;
  onDeleteTodo: (id: string) => void;
  onToggleSelectTodo: (id: string) => void;
  onToggleAllSelectTodos: (selected: boolean) => void;
  onStartSelectionMode: () => void;
  onCancelSelectionMode: () => void;
  onTriggerBulkImport: () => void;
};

export function TodoActiveGroup({
  activeTab,
  activeTodos,
  categories,
  isSelectionMode,
  selectedTodoIds,
  onToggleTodo,
  onDeleteTodo,
  onToggleSelectTodo,
  onToggleAllSelectTodos,
  onStartSelectionMode,
  onCancelSelectionMode,
  onTriggerBulkImport,
}: TodoActiveGroupProps) {
  const selectedTodoIdsSet = useMemo(
    () => new Set(selectedTodoIds),
    [selectedTodoIds],
  );

  return (
    <div
      className={cn(
        "border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-5 rounded-3xl transition-all",
        activeTab !== "active" && "hidden md:block",
      )}
    >
      <div className="flex flex-row items-center justify-between pb-3 border-b border-(--card-border) mb-4 gap-2">
        <div className="flex items-center gap-2">
          <ShoppingBag size={14} className="text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-(--text-muted)">
            <span className="hidden sm:inline">Articoli da Acquistare</span>
            <span className="sm:hidden">Da Acquistare</span> (
            {activeTodos.length})
          </span>
        </div>

        {activeTodos.length > 0 && (
          <div className="flex items-center gap-1.5 self-center">
            {isSelectionMode ? (
              <TodoBulkActions
                activeTodos={activeTodos}
                selectedTodoIds={selectedTodoIds}
                onToggleAllSelectTodos={onToggleAllSelectTodos}
                onTriggerBulkImport={onTriggerBulkImport}
                onCancelSelectionMode={onCancelSelectionMode}
              />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeTodos.map((todoItem) => (
          <TodoItemRow
            key={todoItem.id}
            todoItem={todoItem}
            categories={categories}
            isSelectionMode={isSelectionMode}
            isSelected={selectedTodoIdsSet.has(todoItem.id)}
            onToggleTodo={onToggleTodo}
            onDeleteTodo={onDeleteTodo}
            onToggleSelectTodo={onToggleSelectTodo}
          />
        ))}

        {activeTodos.length === 0 && (
          <div className="text-center py-10 text-xs text-(--text-muted) font-medium col-span-full">
            Nessun elemento attivo in questa lista. Aggiungine uno qui sopra!
          </div>
        )}
      </div>
    </div>
  );
}
