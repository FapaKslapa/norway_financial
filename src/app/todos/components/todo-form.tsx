"use client";

import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { MoneyInput } from "@/components/ui/money-input";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type TodoFormProps = {
  activeListId: string;
  listName: string;
  categories: Category[];
  onAddTodo: (todo: {
    title: string;
    notes: string;
    categoryId: string | null;
    estimatedAmount?: number;
    estimatedCurrency?: string;
  }) => Promise<void>;
};

export function TodoForm({
  activeListId,
  listName,
  categories,
  onAddTodo,
}: TodoFormProps) {
  const { displayCurrency } = useDashboard();
  const [todoTitle, setTodoTitle] = useState("");
  const [todoNotes] = useState("");
  const [todoCategoryId, setTodoCategoryId] = useState("");
  const [todoEstAmount, setTodoEstAmount] = useState("");
  const [todoEstCurrency, setTodoEstCurrency] =
    useState<string>(displayCurrency);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle || !activeListId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTodo({
        title: todoTitle,
        notes: todoNotes,
        categoryId: todoCategoryId || null,
        estimatedAmount: todoEstAmount ? parseFloat(todoEstAmount) : undefined,
        estimatedCurrency: todoEstAmount ? todoEstCurrency : undefined,
      });

      setTodoTitle("");
      setTodoEstAmount("");
      setTodoCategoryId("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl shadow-[var(--card-shadow)] relative z-20"
    >
      <input
        type="text"
        placeholder={`Aggiungi articolo a "${listName}"...`}
        value={todoTitle}
        onChange={(e) => setTodoTitle(e.target.value)}
        required
        className="text-xs text-[var(--foreground)] flex-1 min-w-0 bg-neutral-500/5 dark:bg-zinc-800/30 border border-[var(--card-border)] focus:border-blue-500/50 h-10 px-3.5 rounded-xl outline-none font-semibold placeholder:font-normal transition-all"
      />
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="w-[130px] shrink-0">
          <CategorySelect
            value={todoCategoryId}
            onChange={setTodoCategoryId}
            categories={categories}
            triggerClassName="h-10 text-xs"
          />
        </div>
        <div className="w-[160px] shrink-0">
          <MoneyInput
            value={todoEstAmount}
            onChange={setTodoEstAmount}
            currency={todoEstCurrency}
            placeholder="0.00"
            className="h-10 border border-[var(--card-border)] bg-neutral-500/5 dark:bg-zinc-800/30"
            inputClassName="text-xs font-bold"
          />
        </div>
        <div className="w-[70px] shrink-0">
          <CurrencySelect
            value={todoEstCurrency}
            onChange={setTodoEstCurrency}
            triggerClassName="h-10 text-[11px] font-bold"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !todoTitle.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white h-10 w-10 rounded-xl cursor-pointer transition-all border-0 shadow-sm shrink-0 flex items-center justify-center"
        >
          {isSubmitting ? "..." : <Plus size={15} />}
        </button>
      </div>
    </form>
  );
}
