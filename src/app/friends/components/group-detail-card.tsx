"use client";

import { Button, Card } from "@heroui/react";
import {
  Activity,
  ChevronLeft,
  PieChart,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { GroupExpenseList } from "./group-expense-list";
import { GroupMemberList, GroupSettlementProposals } from "./group-member-list";

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
      {/* Header */}
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

      {/* Membri del Gruppo */}
      <GroupMemberList
        members={selectedGroup.members}
        currentUserId={currentUserId}
      />

      {/* Debiti Semplificati */}
      <GroupSettlementProposals
        proposals={proposals}
        isProposalsLoading={isProposalsLoading}
        currentUserId={currentUserId}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
        isSettlingId={isSettlingId}
        onSettle={handleSettlePress}
      />

      {/* Stats */}
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

      {/* Cronologia Spese */}
      <GroupExpenseList
        transactions={transactions}
        allTransactions={allTransactions}
        currentUserId={currentUserId}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
      />
    </Card>
  );
}
