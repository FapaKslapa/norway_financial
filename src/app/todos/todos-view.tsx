"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useMemo, useReducer, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { useTRPC } from "@/lib/trpc/client";
import { TodoForm } from "./components/todo-form";
import { TodoHeader } from "./components/todo-header";
import { type TodoItem, TodoItems } from "./components/todo-items";
import { TodoLists } from "./components/todo-lists";
import { TodoModalsContainer } from "./components/todo-modals-container";

type UIState = {
  activeListId: string;
  isSelectionMode: boolean;
  selectedTodoIds: string[];
  isBulkImportOpen: boolean;
  isNewListOpen: boolean;
  newListName: string;
  importingTodo: TodoItem | null;
  listToDelete: string | null;
  todoToDelete: string | null;
};

type UIAction =
  | { type: "SET_FIELD"; field: keyof UIState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<UIState> };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

function useTodoView() {
  const { exchangeRate } = useDashboard();
  const trpc = useTRPC();

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery(
    trpc.category.list.queryOptions(),
  );
  const {
    data: listsData,
    isLoading: isListsLoading,
    refetch: refetchLists,
  } = useQuery(trpc.todo.listLists.queryOptions());

  const [uiState, dispatch] = useReducer(uiReducer, {
    activeListId: "",
    isSelectionMode: false,
    selectedTodoIds: [],
    isBulkImportOpen: false,
    isNewListOpen: false,
    newListName: "",
    importingTodo: null,
    listToDelete: null,
    todoToDelete: null,
  });

  const {
    activeListId,
    isSelectionMode,
    selectedTodoIds,
    isBulkImportOpen,
    isNewListOpen,
    newListName,
    importingTodo,
    listToDelete,
    todoToDelete,
  } = uiState;

  const setActiveListId = (val: string) => dispatch({ type: "SET_FIELD", field: "activeListId", value: val });
  const setIsSelectionMode = (val: boolean) => dispatch({ type: "SET_FIELD", field: "isSelectionMode", value: val });
  const setSelectedTodoIds = (val: string[] | ((prev: string[]) => string[])) => {
    if (typeof val === "function") {
      dispatch({ type: "SET_FIELD", field: "selectedTodoIds", value: val(selectedTodoIds) });
    } else {
      dispatch({ type: "SET_FIELD", field: "selectedTodoIds", value: val });
    }
  };
  const setIsBulkImportOpen = (val: boolean) => dispatch({ type: "SET_FIELD", field: "isBulkImportOpen", value: val });
  const setIsNewListOpen = (val: boolean) => dispatch({ type: "SET_FIELD", field: "isNewListOpen", value: val });
  const setNewListName = (val: string) => dispatch({ type: "SET_FIELD", field: "newListName", value: val });
  const setImportingTodo = (val: TodoItem | null) => dispatch({ type: "SET_FIELD", field: "importingTodo", value: val });
  const setListToDelete = (val: string | null) => dispatch({ type: "SET_FIELD", field: "listToDelete", value: val });
  const setTodoToDelete = (val: string | null) => dispatch({ type: "SET_FIELD", field: "todoToDelete", value: val });

  const selectedTodoIdsSet = useMemo(
    () => new Set(selectedTodoIds),
    [selectedTodoIds],
  );

  const actualActiveListId =
    activeListId || (listsData && listsData.length > 0 ? listsData[0].id : "");

  const handleSelectActiveList = (id: string) => {
    setActiveListId(id);
    setSelectedTodoIds([]);
    setIsSelectionMode(false);
  };

  const { data: todosData, refetch: refetchTodos } = useQuery(
    trpc.todo.list.queryOptions(
      { todoListId: actualActiveListId },
      { enabled: !!actualActiveListId },
    ),
  );

  const createListMutation = useMutation(
    trpc.todo.createList.mutationOptions({
      onSuccess: () => refetchLists(),
    }),
  );
  const deleteListMutation = useMutation(
    trpc.todo.deleteList.mutationOptions({
      onSuccess: () => {
        refetchLists();
        handleSelectActiveList("");
      },
    }),
  );
  const createTodoMutation = useMutation(
    trpc.todo.create.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const toggleTodoMutation = useMutation(
    trpc.todo.toggle.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const deleteTodoMutation = useMutation(
    trpc.todo.delete.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const convertTodoMutation = useMutation(
    trpc.todo.convertToTransaction.mutationOptions({
      onSuccess: () => refetchTodos(),
    }),
  );
  const convertTodoBulkMutation = useMutation(
    trpc.todo.convertToTransactionBulk.mutationOptions({
      onSuccess: () => {
        refetchTodos();
        refetchLists();
        setIsSelectionMode(false);
        setSelectedTodoIds([]);
      },
    }),
  );

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const list = await createListMutation.mutateAsync({ name: newListName });
    handleSelectActiveList(list.id);
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

  const handleImportTodoBulk = async (data: {
    todoIds: string[];
    amount: number;
    currency: string;
    date: string;
    description: string;
    categoryId: string | null;
  }) => {
    await convertTodoBulkMutation.mutateAsync({
      todoIds: data.todoIds,
      amount: data.amount,
      currency: data.currency,
      exchangeRate,
      date: data.date,
      description: data.description,
      categoryId: data.categoryId,
    });
  };

  const handleToggleSelectTodo = (id: string) => {
    setSelectedTodoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAllSelectTodos = (selected: boolean) => {
    if (selected) {
      const activeTodos = (todosData || []).filter((t) => !t.completed);
      setSelectedTodoIds(activeTodos.map((t) => t.id));
    } else {
      setSelectedTodoIds([]);
    }
  };

  const activeListName =
    (listsData || []).find((l) => l.id === actualActiveListId)?.name || "";

  return {
    isCategoriesLoading,
    isListsLoading,
    categoriesData,
    listsData,
    todosData,
    actualActiveListId,
    activeListName,
    isSelectionMode,
    selectedTodoIds,
    selectedTodoIdsSet,
    isBulkImportOpen,
    isNewListOpen,
    newListName,
    importingTodo,
    listToDelete,
    todoToDelete,
    setNewListName,
    setIsNewListOpen,
    setListToDelete,
    setTodoToDelete,
    setImportingTodo,
    setIsBulkImportOpen,
    setIsSelectionMode,
    setSelectedTodoIds,
    handleSelectActiveList,
    handleCreateList,
    handleDeleteListConfirm,
    handleDeleteTodoConfirm,
    handleCreateTodo,
    handleToggleTodo,
    handleImportTodo,
    handleImportTodoBulk,
    handleToggleSelectTodo,
    handleToggleAllSelectTodos,
  };
}

export default function TodosView() {
  const {
    isCategoriesLoading,
    isListsLoading,
    categoriesData,
    listsData,
    todosData,
    actualActiveListId,
    activeListName,
    isSelectionMode,
    selectedTodoIds,
    selectedTodoIdsSet,
    isBulkImportOpen,
    isNewListOpen,
    newListName,
    importingTodo,
    listToDelete,
    todoToDelete,
    setNewListName,
    setIsNewListOpen,
    setListToDelete,
    setTodoToDelete,
    setImportingTodo,
    setIsBulkImportOpen,
    setIsSelectionMode,
    setSelectedTodoIds,
    handleSelectActiveList,
    handleCreateList,
    handleDeleteListConfirm,
    handleDeleteTodoConfirm,
    handleCreateTodo,
    handleToggleTodo,
    handleImportTodo,
    handleImportTodoBulk,
    handleToggleSelectTodo,
    handleToggleAllSelectTodos,
  } = useTodoView();

  if (isCategoriesLoading || isListsLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <TodoHeader onNewList={() => setIsNewListOpen(true)} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-1"
        >
          <TodoLists
            lists={listsData || []}
            activeListId={actualActiveListId}
            onSelectActiveList={handleSelectActiveList}
            onDeleteList={setListToDelete}
          />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-3 flex flex-col gap-4"
        >
          {actualActiveListId ? (
            <>
              <TodoForm
                activeListId={actualActiveListId}
                listName={activeListName}
                categories={categoriesData || []}
                onAddTodo={handleCreateTodo}
              />

              <TodoItems
                todos={todosData || []}
                categories={categoriesData || []}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={setTodoToDelete}
                onImportTodo={setImportingTodo}
                isSelectionMode={isSelectionMode}
                selectedTodoIds={selectedTodoIds}
                onToggleSelectTodo={handleToggleSelectTodo}
                onToggleAllSelectTodos={handleToggleAllSelectTodos}
                onStartSelectionMode={() => setIsSelectionMode(true)}
                onCancelSelectionMode={() => {
                  setIsSelectionMode(false);
                  setSelectedTodoIds([]);
                }}
                onTriggerBulkImport={() => setIsBulkImportOpen(true)}
              />
            </>
          ) : (
            <div className="text-center py-12 text-xs text-(--text-muted) font-medium bg-(--card-solid) border border-(--card-border) rounded-2xl shadow-sm">
              Nessuna lista selezionata. Selezionane o creane una.
            </div>
          )}
        </m.div>
      </div>

      <TodoModalsContainer
        isNewListOpen={isNewListOpen}
        newListName={newListName}
        onNewListNameChange={setNewListName}
        onNewListClose={() => setIsNewListOpen(false)}
        onNewListSubmit={handleCreateList}
        importingTodo={importingTodo}
        onImportTodoClose={() => setImportingTodo(null)}
        onImportTodoConfirm={handleImportTodo}
        isBulkImportOpen={isBulkImportOpen}
        onBulkImportClose={() => setIsBulkImportOpen(false)}
        selectedTodos={(todosData || []).filter((t) =>
          selectedTodoIdsSet.has(t.id),
        )}
        categories={categoriesData || []}
        onBulkImportConfirm={handleImportTodoBulk}
        listToDelete={listToDelete}
        onDeleteListClose={() => setListToDelete(null)}
        onDeleteListConfirm={handleDeleteListConfirm}
        todoToDelete={todoToDelete}
        onDeleteTodoClose={() => setTodoToDelete(null)}
        onDeleteTodoConfirm={handleDeleteTodoConfirm}
      />
    </div>
  );
}
