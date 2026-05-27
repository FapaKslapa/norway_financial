"use client";

import { motion } from "framer-motion";
import { FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { trpc } from "@/lib/trpc/client";
import { NewListModal } from "./components/new-list-modal";
import { TodoConvertModal } from "./components/todo-convert-modal";
import { TodoForm } from "./components/todo-form";
import { type TodoItem, TodoItems } from "./components/todo-items";
import { TodoLists } from "./components/todo-lists";

export default function TodosView() {
  const { exchangeRate } = useDashboard();

  const categoriesQuery = trpc.category.list.useQuery();
  const listsQuery = trpc.todo.listLists.useQuery();

  const [activeListId, setActiveListId] = useState<string>("");

  const todosQuery = trpc.todo.list.useQuery(
    { todoListId: activeListId },
    { enabled: !!activeListId },
  );

  useEffect(() => {
    if (listsQuery.data && listsQuery.data.length > 0 && !activeListId) {
      setActiveListId(listsQuery.data[0].id);
    }
  }, [listsQuery.data, activeListId]);

  const createListMutation = trpc.todo.createList.useMutation({
    onSuccess: () => listsQuery.refetch(),
  });
  const deleteListMutation = trpc.todo.deleteList.useMutation({
    onSuccess: () => {
      listsQuery.refetch();
      setActiveListId("");
    },
  });
  const createTodoMutation = trpc.todo.create.useMutation({
    onSuccess: () => todosQuery.refetch(),
  });
  const toggleTodoMutation = trpc.todo.toggle.useMutation({
    onSuccess: () => todosQuery.refetch(),
  });
  const deleteTodoMutation = trpc.todo.delete.useMutation({
    onSuccess: () => todosQuery.refetch(),
  });
  const convertTodoMutation = trpc.todo.convertToTransaction.useMutation({
    onSuccess: () => todosQuery.refetch(),
  });

  const [isNewListOpen, setIsNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const [importingTodo, setImportingTodo] = useState<TodoItem | null>(null);

  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  if (categoriesQuery.isLoading || listsQuery.isLoading) {
    return <LoadingState />;
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const list = await createListMutation.mutateAsync({ name: newListName });
    setActiveListId(list.id);
    setNewListName("");
    setIsNewListOpen(false);
  };

  const handleDeleteListConfirm = async () => {
    if (listToDelete) {
      await deleteListMutation.mutateAsync({ id: listToDelete });
      setListToDelete(null);
    }
  };

  const handleDeleteTodoConfirm = async () => {
    if (todoToDelete) {
      await deleteTodoMutation.mutateAsync({ id: todoToDelete });
      setTodoToDelete(null);
    }
  };

  const handleCreateTodo = async (todo: {
    title: string;
    notes: string;
    categoryId: string | null;
    estimatedAmount?: number;
    estimatedCurrency?: string;
  }) => {
    if (!activeListId) return;

    await createTodoMutation.mutateAsync({
      todoListId: activeListId,
      title: todo.title,
      notes: todo.notes,
      categoryId: todo.categoryId,
      estimatedAmount: todo.estimatedAmount,
      estimatedCurrency: todo.estimatedCurrency,
    });
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    await toggleTodoMutation.mutateAsync({ id, completed });
  };

  const handleImportTodo = async (data: {
    todoId: string;
    amount: number;
    currency: string;
    date: string;
  }) => {
    await convertTodoMutation.mutateAsync({
      todoId: data.todoId,
      amount: data.amount,
      currency: data.currency,
      exchangeRate,
      date: data.date,
    });
  };

  const activeListName =
    (listsQuery.data || []).find((l) => l.id === activeListId)?.name || "";

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-between items-end flex-wrap gap-4 select-none"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
            Liste da fare
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Shopping & Liste Spesa
          </h2>
          <p className="text-[var(--text-muted)] text-xs">
            Gestisci più liste di cose da comprare ed importale come spese
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewListOpen(true)}
          className="font-bold text-xs bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-xl px-4 h-10 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <FolderPlus size={14} /> Nuova Lista
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-1"
        >
          <TodoLists
            lists={listsQuery.data || []}
            activeListId={activeListId}
            onSelectActiveList={setActiveListId}
            onDeleteList={setListToDelete}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-3 flex flex-col gap-4"
        >
          {activeListId ? (
            <>
              <TodoForm
                activeListId={activeListId}
                listName={activeListName}
                categories={categoriesQuery.data || []}
                onAddTodo={handleCreateTodo}
              />

              <TodoItems
                todos={todosQuery.data || []}
                categories={categoriesQuery.data || []}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={setTodoToDelete}
                onImportTodo={setImportingTodo}
              />
            </>
          ) : (
            <div className="text-center py-12 text-xs text-[var(--text-muted)] font-medium bg-[var(--card-solid)] border border-[var(--card-border)] rounded-2xl shadow-sm">
              Nessuna lista selezionata. Selezionane o creane una.
            </div>
          )}
        </motion.div>
      </div>

      <NewListModal
        isOpen={isNewListOpen}
        name={newListName}
        onChangeName={setNewListName}
        onClose={() => setIsNewListOpen(false)}
        onSubmit={handleCreateList}
      />

      <TodoConvertModal
        isOpen={importingTodo !== null}
        onClose={() => setImportingTodo(null)}
        todoItem={importingTodo}
        onConvert={handleImportTodo}
      />

      <ConfirmationDialog
        isOpen={listToDelete !== null}
        onClose={() => setListToDelete(null)}
        onConfirm={handleDeleteListConfirm}
        title="Elimina Lista Spesa"
        message="Sei sicuro di voler eliminare questa lista e tutti i suoi elementi? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />

      <ConfirmationDialog
        isOpen={todoToDelete !== null}
        onClose={() => setTodoToDelete(null)}
        onConfirm={handleDeleteTodoConfirm}
        title="Elimina Articolo"
        message="Sei sicuro di voler eliminare questo articolo dalla lista? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />
    </div>
  );
}
