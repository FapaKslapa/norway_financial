"use client";

import { Button } from "@heroui/react";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { RecurrentTransactionCard } from "./recurrent-transaction-card";
import { RecurrentTransactionDrawer } from "./recurrent-transaction-drawer";
import { RecurrentTransactionRow } from "./recurrent-transaction-row";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type RecurrentTx = {
  id: string;
  description: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  type: string;
  frequency: string;
  startDate: Date | string;
  endDate: Date | string | null;
  status: string;
  nextOccurrence?: Date | string | null;
};

type RecurrentTransactionsManagerProps = {
  categories: CategoryOption[];
};

export function RecurrentTransactionsManager({
  categories,
}: RecurrentTransactionsManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<RecurrentTx | null>(null);

  const listQuery = trpc.recurrentTransaction.list.useQuery();

  const toggleStatusMutation =
    trpc.recurrentTransaction.toggleStatus.useMutation({
      onSuccess: () => {
        listQuery.refetch();
      },
    });

  const deleteMutation = trpc.recurrentTransaction.delete.useMutation({
    onSuccess: () => {
      listQuery.refetch();
    },
  });

  const handleEdit = (rt: RecurrentTx) => {
    setEditingTx(rt);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    await toggleStatusMutation.mutateAsync({ id, status: nextStatus });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-foreground">
            Pianificatore Ricorrenti
          </h3>
          <p className="text-[10px] text-(--text-muted)">
            Gestisci le tue entrate e spese ripetute nel tempo
          </p>
        </div>
        <Button
          variant="outline"
          className="h-8 text-[10px] font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-0 rounded-xl px-3 flex items-center gap-1.5 cursor-pointer transition-all"
          onPress={() => setIsFormOpen(true)}
        >
          <Plus size={12} />
          <span>Nuova Ricorrente</span>
        </Button>
      </div>

      <RecurrentTransactionDrawer
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTx(null);
        }}
        categories={categories}
        editingTx={editingTx}
        onSubmitSuccess={() => listQuery.refetch()}
      />

      <div className="bg-(--card) border border-(--card-border) rounded-[2rem] p-5 shadow-sm">
        {listQuery.isLoading ? (
          <div className="text-center py-8 text-(--text-muted) text-xs font-bold">
            Caricamento pianificatore...
          </div>
        ) : listQuery.data && listQuery.data.length > 0 ? (
          <>
            <div className="hidden md:block overflow-x-auto scrollbar-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--card-border) text-[9px] text-(--text-muted) font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Descrizione</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Stato</th>
                    <th className="pb-3">Importo</th>
                    <th className="pb-3">Frequenza</th>
                    <th className="pb-3">Scadenza</th>
                    <th className="pb-3">Prossima Esecuzione</th>
                    <th className="pb-3 text-right pr-2">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--card-border)/50 text-xs">
                  {listQuery.data.map((rt) => {
                    const category = categories.find(
                      (c) => c.id === rt.categoryId,
                    );
                    return (
                      <RecurrentTransactionRow
                        key={rt.id}
                        rt={rt}
                        category={category}
                        onToggleStatus={handleToggleStatus}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeletePending={deleteMutation.isPending}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="block md:hidden flex flex-col gap-4">
              {listQuery.data.map((rt) => {
                const category = categories.find((c) => c.id === rt.categoryId);
                return (
                  <RecurrentTransactionCard
                    key={rt.id}
                    rt={rt}
                    category={category}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeletePending={deleteMutation.isPending}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-(--text-muted)">
            <CalendarDays size={24} className="mb-2 opacity-40" />
            <span className="text-[11px] font-bold">
              Nessuna regola ricorrente attiva
            </span>
            <p className="text-[9px] opacity-75 max-w-[200px] mt-1">
              Crea una regola per automatizzare l'inserimento di stipendi,
              abbonamenti o affitto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
