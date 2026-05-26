"use client";

import { Button, InputGroup } from "@heroui/react";
import type React from "react";
import { useState } from "react";
import { CategoryIcon } from "../../../components/icon-helper";
import { CustomSelect } from "../../../components/ui/custom-select";
import { MoneyInput } from "../../../components/ui/money-input";

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
    estimatedCurrency?: "EUR" | "NOK";
  }) => Promise<void>;
};

export function TodoForm({
  activeListId,
  listName,
  categories,
  onAddTodo,
}: TodoFormProps) {
  const [todoTitle, setTodoTitle] = useState("");
  const [todoNotes, setTodoNotes] = useState("");
  const [todoCategoryId, setTodoCategoryId] = useState("");
  const [todoEstAmount, setTodoEstAmount] = useState("");
  const [todoEstCurrency, setTodoEstCurrency] = useState<"EUR" | "NOK">("NOK");
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
      setTodoNotes("");
      setTodoEstAmount("");
      setTodoCategoryId("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 apple-widget transition-all overflow-visible relative z-20">
      <div className="p-0 pb-3 border-b border-[var(--card-border)] mb-4">
        <h4 className="text-xs font-black uppercase tracking-wider">
          Aggiungi articolo a:{" "}
          <span className="text-blue-500 font-extrabold ml-0.5">
            {listName}
          </span>
        </h4>
      </div>
      <div className="p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <InputGroup className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-10 px-3 rounded-xl flex items-center border-0 flex-1 focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 transition-all duration-300">
              <InputGroup.Input
                type="text"
                placeholder="es. Pane, Latte, detersivo..."
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
                required
                className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full"
              />
            </InputGroup>

            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-10 rounded-xl px-4 cursor-pointer hover:opacity-90 shadow-sm"
            >
              {isSubmitting ? "Aggiunta..." : "Aggiungi"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase ml-1">
                Prezzo Stima
              </span>
              <MoneyInput
                value={todoEstAmount}
                onChange={setTodoEstAmount}
                currency={todoEstCurrency}
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase ml-1">
                Valuta
              </span>
              <CustomSelect
                value={todoEstCurrency}
                onChange={(val: string) =>
                  setTodoEstCurrency(val as "EUR" | "NOK")
                }
                triggerClassName="h-9"
                options={[
                  { value: "NOK", label: "NOK" },
                  { value: "EUR", label: "EUR" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase ml-1">
                Categoria
              </span>
              <CustomSelect
                value={todoCategoryId}
                onChange={setTodoCategoryId}
                placeholder="Tutte"
                triggerClassName="h-9"
                options={[
                  {
                    value: "",
                    label: "Tutte le categorie",
                    color: "#8E8E93",
                    icon: <CategoryIcon name="Sparkles" size={11} />,
                  },
                  ...categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                    color: cat.color,
                    icon: <CategoryIcon name={cat.icon} size={11} />,
                  })),
                ]}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
