"use client";

import { Button, Card } from "@heroui/react";
import {
  Activity,
  Calendar,
  ChevronLeft,
  PieChart,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { cn, formatCurrency } from "@/lib/utils";

type GroupMember = {
  id: string;
  name: string;
  email: string;
};

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

type GroupSettlementProposal = {
  fromUser: { id: string; name: string; email: string; image: string | null };
  toUser: { id: string; name: string; email: string; image: string | null };
  amountNok: number;
};

type TransactionInfo = {
  id: string;
  userId: string;
  payerName?: string | null;
  amountEur: string;
  amountNok: string;
  description: string | null;
  date: Date;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
  } | null;
};

type GroupDetailCardProps = {
  selectedGroup: GroupItem;
  onClear: () => void;
  onOpenSharedExpense: () => void;
  onOpenDeleteGroup: (group: GroupItem) => void;
  proposals: GroupSettlementProposal[];
  isProposalsLoading: boolean;
  onSettle: (friendId: string) => Promise<void>;
  transactions: TransactionInfo[];
  currentUserId: string;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  convertCurrency: (amount: number, from: string, to: string) => number;
  allTransactions: TransactionInfo[];
};

export function GroupDetailCard({
  selectedGroup,
  onClear,
  onOpenSharedExpense,
  onOpenDeleteGroup,
  proposals,
  isProposalsLoading,
  onSettle,
  transactions,
  currentUserId,
  displayCurrency,
  convertNokAmount,
  convertCurrency,
  allTransactions,
}: GroupDetailCardProps) {
  const [isSettlingId, setIsSettlingId] = useState<string | null>(null);

  const handleSettlePress = async (friendId: string) => {
    setIsSettlingId(friendId);
    try {
      await onSettle(friendId);
    } finally {
      setIsSettlingId(null);
    }
  };

  const totalNok = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amountNok),
    0,
  );

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-6 rounded-[2rem] flex flex-col">
      {}
      <div className="flex justify-between items-center pb-5 border-b border-(--card-border) mb-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <Button
            isIconOnly
            variant="ghost"
            className="h-8 w-8 text-(--text-muted) hover:bg-neutral-500/10 rounded-xl cursor-pointer border-0 shrink-0 flex items-center justify-center"
            onPress={onClear}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-foreground truncate leading-tight">
              {selectedGroup.name}
            </span>
            <span className="text-[10px] text-(--text-muted) truncate mt-0.5">
              {selectedGroup.members.length} partecipanti
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            className="font-bold text-[10px] h-8 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-0 rounded-xl px-2.5 sm:px-3 flex items-center gap-1 cursor-pointer transition-all shrink-0"
            onPress={onOpenSharedExpense}
          >
            <Plus size={11} />
            <span className="hidden sm:inline">Aggiungi Spesa</span>
            <span className="sm:hidden">Aggiungi</span>
          </Button>
          {selectedGroup.creatorId === currentUserId && (
            <Button
              isIconOnly
              variant="ghost"
              className="h-8 w-8 text-(--text-muted) hover:text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-0 shrink-0 flex items-center justify-center"
              onPress={() => onOpenDeleteGroup(selectedGroup)}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>

      {}
      <div className="mb-5">
        <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Users size={12} className="opacity-60" />
          Membri del Gruppo
        </h4>
        <div className="flex flex-wrap gap-2">
          {selectedGroup.members.map((m: GroupMember) => (
            <div
              key={m.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-500/5 border border-(--card-border) text-xs font-semibold"
            >
              <div className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[8px] font-black shrink-0">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <span>
                {m.name} {m.id === currentUserId && "(Tu)"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 border-t border-(--card-border)/50 pt-4">
        <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles size={12} className="text-blue-500" />
          Debiti Semplificati (Algoritmo Splitwise)
        </h4>
        {isProposalsLoading ? (
          <div className="text-[10px] text-(--text-muted)">
            Calcolo liquidazioni ottimali...
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="flex flex-col gap-2">
            {proposals.map((p: GroupSettlementProposal) => {
              const isFromMe = p.fromUser.id === currentUserId;
              const isToMe = p.toUser.id === currentUserId;
              const canSettle = isFromMe || isToMe;
              const targetFriendId = isFromMe ? p.toUser.id : p.fromUser.id;

              return (
                <div
                  key={`${p.fromUser.id}-${p.toUser.id}-${p.amountNok}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-100/5 dark:bg-zinc-800/10 border border-(--card-border)/40 rounded-2xl p-3"
                >
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span
                      className={cn(
                        "font-bold",
                        isFromMe ? "text-rose-500" : "text-foreground",
                      )}
                    >
                      {p.fromUser.name} {isFromMe && "(Tu)"}
                    </span>
                    <span className="text-[10px] text-(--text-muted)">
                      deve dare a
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        isToMe ? "text-emerald-500" : "text-foreground",
                      )}
                    >
                      {p.toUser.name} {isToMe && "(Tu)"}
                    </span>
                    <span className="text-xs font-black text-blue-500 ml-1">
                      {formatCurrency(
                        convertCurrency(p.amountNok, "NOK", displayCurrency),
                        displayCurrency,
                      )}
                    </span>
                  </div>
                  {canSettle && (
                    <Button
                      variant="outline"
                      className="h-7 text-[9px] font-bold bg-neutral-500/10 hover:bg-blue-500 hover:text-white rounded-lg px-3 shrink-0 cursor-pointer border-0 transition-all self-end sm:self-auto"
                      onPress={() => handleSettlePress(targetFriendId)}
                      isDisabled={isSettlingId !== null}
                    >
                      {isSettlingId === targetFriendId
                        ? "Salvataggio..."
                        : "Salda"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-(--text-muted) italic pl-1">
            Tutti i debiti in questo gruppo sono saldati!
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Spese in Cartella"
          value={transactions.length}
          subtitle="Transazioni totali"
          icon={<Activity size={20} />}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
          delayIndex={0}
        />

        <StatCard
          title="Totale Speso nel Gruppo"
          value={formatCurrency(convertNokAmount(totalNok), displayCurrency)}
          subtitle={`${totalNok.toFixed(0)} NOK`}
          icon={<PieChart size={20} />}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
          valueClassName="text-blue-500"
          delayIndex={1}
        />
      </div>

      {}
      <div className="flex flex-col flex-1">
        <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity size={12} className="opacity-60" />
          Cronologia Spese Gruppo
        </h4>

        <div className="flex-1 overflow-y-auto max-h-[200px] pr-1 flex flex-col gap-2.5">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-(--text-muted) font-semibold">
              Nessuna spesa inserita per questo gruppo.
            </div>
          ) : (
            transactions.map((tx) => {
              const isPayer = tx.userId === currentUserId;

              let activeAmount = 0;
              if (isPayer) {
                const totalNok = parseFloat(tx.amountNok);
                const totalOthersSplitsNok = allTransactions
                  .filter(
                    (t) =>
                      t.id === tx.id &&
                      t.sharedInfo &&
                      t.sharedInfo.payerId === currentUserId,
                  )
                  .reduce(
                    (sum, t) =>
                      sum + parseFloat(t.sharedInfo?.splitAmountNok ?? "0"),
                    0,
                  );

                const myShareNok = totalNok - totalOthersSplitsNok;
                activeAmount = convertCurrency(
                  myShareNok,
                  "NOK",
                  displayCurrency,
                );
              } else {
                const mySplit = allTransactions.find(
                  (t) =>
                    t.id === tx.id &&
                    t.sharedInfo &&
                    t.sharedInfo.borrowerId === currentUserId,
                );

                const splitNok = mySplit?.sharedInfo
                  ? parseFloat(mySplit.sharedInfo.splitAmountNok)
                  : 0;
                activeAmount = convertCurrency(
                  splitNok,
                  "NOK",
                  displayCurrency,
                );
              }

              const originalAmount = convertCurrency(
                parseFloat(tx.amountEur),
                "EUR",
                displayCurrency,
              );

              return (
                <div
                  key={tx.id}
                  className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-(--card-border) shrink-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate leading-tight">
                      {tx.description || "Spesa gruppo"}
                    </span>
                    <span className="text-[8px] text-(--text-muted) font-semibold flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={9} />
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        {isPayer
                          ? "Hai pagato tu"
                          : `Ha pagato ${tx.payerName || "Membro"}`}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={cn(
                        "text-xs font-black",
                        isPayer ? "text-emerald-500" : "text-rose-500",
                      )}
                    >
                      {isPayer ? "+" : "-"}{" "}
                      {formatCurrency(activeAmount, displayCurrency)}
                    </span>
                    <span className="text-[8px] text-(--text-muted) font-semibold mt-0.5">
                      Totale: {formatCurrency(originalAmount, displayCurrency)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
