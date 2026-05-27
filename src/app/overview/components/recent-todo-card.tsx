"use client";

import { Card, CardContent } from "@heroui/react";
import { ArrowRight, CheckSquare } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type TodoType = {
  id: string;
  title: string;
  completed: boolean;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

type RecentTodoCardProps = {
  todos: TodoType[];
  displayCurrency: string;
};

export function RecentTodoCard({
  todos,
  displayCurrency,
}: RecentTodoCardProps) {
  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget h-full flex flex-col justify-between transition-all">
      <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
            <CheckSquare size={15} />
          </div>
          <span className="font-bold text-xs">Elementi da Acquistare</span>
        </div>
        <Link
          href="/todos"
          className="text-xs text-blue-500 font-bold flex items-center gap-0.5 hover:underline"
        >
          Gestisci liste <ArrowRight size={12} />
        </Link>
      </div>

      <CardContent className="p-0 flex-1 overflow-y-auto max-h-56 flex flex-col gap-2">
        {todos.slice(0, 4).map((todoItem) => {
          const estAmountNum = todoItem.estimatedAmount
            ? parseFloat(todoItem.estimatedAmount)
            : null;
          return (
            <div
              key={todoItem.id}
              className={`flex justify-between items-center p-2.5 rounded-xl border border-[var(--card-border)] bg-neutral-500/5 ${
                todoItem.completed ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-bold truncate text-[var(--foreground)]">
                  {todoItem.title}
                </span>
                {estAmountNum && (
                  <span className="text-[9px] text-[var(--text-muted)] font-medium">
                    Stima:{" "}
                    {formatCurrency(
                      estAmountNum,
                      (todoItem.estimatedCurrency || displayCurrency) as
                        | "EUR"
                        | "NOK",
                    )}
                  </span>
                )}
              </div>
              <div>
                {todoItem.completed ? (
                  <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded-lg">
                    Pronto
                  </span>
                ) : (
                  <span className="text-[8px] font-bold text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded-lg">
                    Attivo
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {todos.length === 0 && (
          <div className="text-center py-8 text-xs text-[var(--text-muted)] font-medium">
            Nessun articolo attivo.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
