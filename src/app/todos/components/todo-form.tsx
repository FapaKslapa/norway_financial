"use client";

import { Plus } from "lucide-react";
import type React from "react";
import { useReducer } from "react";
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

type FormState = {
  todoTitle: string;
  todoCategoryId: string;
  todoEstAmount: string;
  todoEstCurrency: string;
  isSubmitting: boolean;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: any }
  | { type: "RESET"; payload: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

export function TodoForm({
  activeListId,
  listName,
  categories,
  onAddTodo,
}: TodoFormProps) {
  const { displayCurrency } = useDashboard();
  const [state, dispatch] = useReducer(formReducer, null, () => ({
    todoTitle: "",
    todoCategoryId: "",
    todoEstAmount: "",
    todoEstCurrency: displayCurrency,
    isSubmitting: false,
  }));

  const { todoTitle, todoCategoryId, todoEstAmount, todoEstCurrency, isSubmitting } = state;
  const todoNotes = "";

  const setTodoTitle = (val: string) => dispatch({ type: "SET_FIELD", field: "todoTitle", value: val });
  const setTodoCategoryId = (val: string) => dispatch({ type: "SET_FIELD", field: "todoCategoryId", value: val });
  const setTodoEstAmount = (val: string) => dispatch({ type: "SET_FIELD", field: "todoEstAmount", value: val });
  const setTodoEstCurrency = (val: string) => dispatch({ type: "SET_FIELD", field: "todoEstCurrency", value: val });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle || !activeListId || isSubmitting) return;

    dispatch({ type: "SET_FIELD", field: "isSubmitting", value: true });
    try {
      await onAddTodo({
        title: todoTitle,
        notes: todoNotes,
        categoryId: todoCategoryId || null,
        estimatedAmount: todoEstAmount ? parseFloat(todoEstAmount) : undefined,
        estimatedCurrency: todoEstAmount ? todoEstCurrency : undefined,
      });

      dispatch({
        type: "RESET",
        payload: {
          todoTitle: "",
          todoCategoryId: "",
          todoEstAmount: "",
          todoEstCurrency: displayCurrency,
          isSubmitting: false,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: "SET_FIELD", field: "isSubmitting", value: false });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 p-2 bg-(--card) border border-(--card-border) rounded-2xl shadow-(--card-shadow) relative z-20"
    >
      <div className="flex items-center gap-2 flex-1">
        <input
          type="text"
          aria-label="Articolo da aggiungere"
          placeholder={`Aggiungi articolo a "${listName}"...`}
          value={todoTitle}
          onChange={(e) => setTodoTitle(e.target.value)}
          required
          className="text-xs text-foreground flex-1 min-w-0 bg-neutral-500/5 dark:bg-zinc-800/30 border border-(--card-border) focus:border-blue-500/50 h-10 px-3.5 rounded-xl outline-none font-semibold placeholder:font-normal transition-all"
        />
        <button
          type="submit"
          aria-label="Aggiungi articolo"
          disabled={isSubmitting || !todoTitle.trim()}
          className="flex sm:hidden bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white h-10 w-10 rounded-xl cursor-pointer transition-all border-0 shadow-sm shrink-0 items-center justify-center"
        >
          {isSubmitting ? "..." : <Plus size={15} />}
        </button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex-1 sm:w-[130px] sm:shrink-0">
          <CategorySelect
            value={todoCategoryId}
            onChange={setTodoCategoryId}
            categories={categories}
            triggerClassName="h-10 text-xs w-full"
          />
        </div>
        <div className="w-[110px] sm:w-[150px] shrink-0">
          <MoneyInput
            value={todoEstAmount}
            onChange={setTodoEstAmount}
            currency={todoEstCurrency}
            placeholder="0.00"
            className="h-10 border border-(--card-border) bg-neutral-500/5 dark:bg-zinc-800/30"
            inputClassName="text-xs font-bold"
          />
        </div>
        <div className="w-[60px] sm:w-[70px] shrink-0">
          <CurrencySelect
            value={todoEstCurrency}
            onChange={setTodoEstCurrency}
            triggerClassName="h-10 text-[11px] font-bold w-full"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !todoTitle.trim()}
          className="hidden sm:flex bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white h-10 w-10 rounded-xl cursor-pointer transition-all border-0 shadow-sm shrink-0 items-center justify-center"
        >
          {isSubmitting ? "..." : <Plus size={15} />}
        </button>
      </div>
    </form>
  );
}
