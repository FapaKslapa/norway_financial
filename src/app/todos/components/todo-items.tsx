"use client";

import { useState } from "react";
import { TodoActiveGroup } from "./todo-active-group";
import { TodoCompletedGroup } from "./todo-completed-group";
import { TodoMobileTabSwitcher } from "./todo-mobile-tab-switcher";

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

export type Category = {
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
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile tab switcher */}
      <TodoMobileTabSwitcher
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCount={activeTodos.length}
        completedCount={completedTodos.length}
      />

      {/* Active items panel */}
      <TodoActiveGroup
        activeTab={activeTab}
        activeTodos={activeTodos}
        categories={categories}
        isSelectionMode={isSelectionMode}
        selectedTodoIds={selectedTodoIds}
        onToggleTodo={onToggleTodo}
        onDeleteTodo={onDeleteTodo}
        onToggleSelectTodo={onToggleSelectTodo}
        onToggleAllSelectTodos={onToggleAllSelectTodos}
        onStartSelectionMode={onStartSelectionMode}
        onCancelSelectionMode={onCancelSelectionMode}
        onTriggerBulkImport={onTriggerBulkImport}
      />

      {/* Completed items panel */}
      {completedTodos.length > 0 && (
        <TodoCompletedGroup
          activeTab={activeTab}
          completedTodos={completedTodos}
          onToggleTodo={onToggleTodo}
          onImportTodo={onImportTodo}
        />
      )}
    </div>
  );
}
