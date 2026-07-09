"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { NewListModal } from "./new-list-modal";
import { TodoBulkConvertModal } from "./todo-bulk-convert-modal";
import { TodoConvertModal } from "./todo-convert-modal";
import type { Category, TodoItem } from "./todo-items";

type TodoModalsContainerProps = {
  isNewListOpen: boolean;
  newListName: string;
  onNewListNameChange: (name: string) => void;
  onNewListClose: () => void;
  onNewListSubmit: (e: React.FormEvent) => void;

  importingTodo: TodoItem | null;
  onImportTodoClose: () => void;
  onImportTodoConfirm: (data: {
    todoId: string;
    amount: number;
    currency: string;
    date: string;
  }) => Promise<void>;

  isBulkImportOpen: boolean;
  onBulkImportClose: () => void;
  selectedTodos: TodoItem[];
  categories: Category[];
  onBulkImportConfirm: (data: {
    todoIds: string[];
    amount: number;
    currency: string;
    date: string;
    description: string;
    categoryId: string | null;
  }) => Promise<void>;

  listToDelete: string | null;
  onDeleteListClose: () => void;
  onDeleteListConfirm: () => void;

  todoToDelete: string | null;
  onDeleteTodoClose: () => void;
  onDeleteTodoConfirm: () => void;
};

export function TodoModalsContainer({
  isNewListOpen,
  newListName,
  onNewListNameChange,
  onNewListClose,
  onNewListSubmit,
  importingTodo,
  onImportTodoClose,
  onImportTodoConfirm,
  isBulkImportOpen,
  onBulkImportClose,
  selectedTodos,
  categories,
  onBulkImportConfirm,
  listToDelete,
  onDeleteListClose,
  onDeleteListConfirm,
  todoToDelete,
  onDeleteTodoClose,
  onDeleteTodoConfirm,
}: TodoModalsContainerProps) {
  return (
    <>
      <NewListModal
        isOpen={isNewListOpen}
        name={newListName}
        onChangeName={onNewListNameChange}
        onClose={onNewListClose}
        onSubmit={onNewListSubmit}
      />

      <TodoConvertModal
        isOpen={importingTodo !== null}
        onClose={onImportTodoClose}
        todoItem={importingTodo}
        onConvert={onImportTodoConfirm}
      />

      <TodoBulkConvertModal
        isOpen={isBulkImportOpen}
        onClose={onBulkImportClose}
        selectedTodos={selectedTodos}
        categories={categories}
        onConvertBulk={onBulkImportConfirm}
      />

      <ConfirmationDialog
        isOpen={listToDelete !== null}
        onClose={onDeleteListClose}
        onConfirm={onDeleteListConfirm}
        title="Elimina Lista Spesa"
        message="Sei sicuro di voler eliminare questa lista e tutti i suoi elementi? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />

      <ConfirmationDialog
        isOpen={todoToDelete !== null}
        onClose={onDeleteTodoClose}
        onConfirm={onDeleteTodoConfirm}
        title="Elimina Articolo"
        message="Sei sicuro di voler eliminare questo articolo dalla lista? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />
    </>
  );
}
