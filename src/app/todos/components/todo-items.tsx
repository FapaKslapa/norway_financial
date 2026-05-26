"use client";

import { Button, Card } from "@heroui/react";
import { Check, Trash2 } from "lucide-react";
import { CategoryIcon } from "../../../components/icon-helper";
import { cn, formatCurrency } from "../../../lib/utils";

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
  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget transition-all">
      <div className="flex flex-col gap-2">
        {todos.map((todoItem) => {
          const estAmountNum = todoItem.estimatedAmount
            ? parseFloat(todoItem.estimatedAmount)
            : null;
          const cat = categories.find((c) => c.id === todoItem.categoryId);
          return (
            <div
              key={todoItem.id}
              className={cn(
                "flex justify-between items-center p-3.5 rounded-2xl border border-[var(--card-border)] bg-neutral-500/5 select-none",
                todoItem.completed && "opacity-60 bg-neutral-500/5",
              )}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={todoItem.completed}
                  className="rounded border-[var(--card-border)] text-blue-500 h-4.5 w-4.5 accent-blue-500 cursor-pointer"
                  onChange={() =>
                    onToggleTodo(todoItem.id, !todoItem.completed)
                  }
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      "text-xs font-bold truncate",
                      todoItem.completed &&
                        "line-through text-[var(--text-muted)]",
                    )}
                  >
                    {todoItem.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {cat && (
                      <span
                        className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded flex items-center gap-0.5"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={9} />
                        {cat.name}
                      </span>
                    )}
                    {estAmountNum && (
                      <span className="text-[9px] text-[var(--text-muted)] font-medium font-sans">
                        Stima:{" "}
                        {formatCurrency(
                          estAmountNum,
                          (todoItem.estimatedCurrency as "EUR" | "NOK") ||
                            "NOK",
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2">
                {todoItem.completed && !todoItem.convertedToTransactionId && (
                  <Button
                    variant="outline"
                    className="text-[9px] font-black px-2 py-1 h-6.5 rounded-lg bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white cursor-pointer select-none"
                    onPress={() => onImportTodo(todoItem)}
                  >
                    Importa
                  </Button>
                )}

                {todoItem.convertedToTransactionId && (
                  <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 select-none">
                    <Check size={10} /> Importato
                  </span>
                )}

                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-rose-500 hover:bg-rose-500/15 rounded-lg h-7 w-7 border-0 cursor-pointer"
                  onPress={() => onDeleteTodo(todoItem.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          );
        })}

        {todos.length === 0 && (
          <div className="text-center py-10 text-xs text-[var(--text-muted)] font-medium">
            Nessun elemento in questa lista. Aggiungine uno qui sopra!
          </div>
        )}
      </div>
    </Card>
  );
}
