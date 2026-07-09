"use client";

import { AnimatePresence, m } from "framer-motion";
import { cn } from "@/lib/utils";
import { FriendDetailCard } from "./friend-detail-card";
import { FriendListPanel } from "./friend-list-panel";
import { GroupDetailCard } from "./group-detail-card";

type FriendUser = { id: string; name: string; email: string; image: string | null };

type FriendItem = {
  friendshipId: string;
  user: FriendUser;
  createdAt: Date | null;
};

type GroupMember = { id: string; name: string; email: string };

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

type BalanceInfo = {
  user: { id: string; name: string; email: string };
  balanceNok: number;
};

type TransactionInfo = {
  id: string;
  userId: string;
  payerName?: string | null;
  amountEur: string;
  amountNok: string;
  description: string | null;
  date: Date;
  groupId?: string | null;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
  } | null;
};

type GroupSettlementProposal = {
  fromUser: { id: string; name: string; email: string; image: string | null };
  toUser: { id: string; name: string; email: string; image: string | null };
  amountNok: number;
};

interface FriendsRightColumnProps {
  activeMobileTab: "friends" | "groups" | "manage";
  selectedFriend: FriendItem | null;
  selectedGroup: GroupItem | null;
  friends: FriendItem[];
  balances: BalanceInfo[];
  transactions: TransactionInfo[];
  proposals: GroupSettlementProposal[];
  isProposalsLoading: boolean;
  currentUserId: string;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onClearFriend: () => void;
  onClearGroup: () => void;
  onSelectFriend: (friend: FriendItem) => void;
  onOpenSharedExpense: () => void;
  onOpenSettleDebt: (friend: FriendItem) => void;
  onOpenDeleteFriend: (friend: FriendItem) => void;
  onOpenDeleteGroup: (group: GroupItem) => void;
  onSettle: (friendId: string) => Promise<void>;
}

export function FriendsRightColumn({
  activeMobileTab,
  selectedFriend,
  selectedGroup,
  friends,
  balances,
  transactions,
  proposals,
  isProposalsLoading,
  currentUserId,
  displayCurrency,
  convertNokAmount,
  convertCurrency,
  onClearFriend,
  onClearGroup,
  onSelectFriend,
  onOpenSharedExpense,
  onOpenSettleDebt,
  onOpenDeleteFriend,
  onOpenDeleteGroup,
  onSettle,
}: FriendsRightColumnProps) {
  const friendTransactions = selectedFriend
    ? transactions.filter(
        (tx) =>
          tx.sharedInfo &&
          ((tx.userId === currentUserId &&
            tx.sharedInfo.borrowerId === selectedFriend.user.id) ||
            (tx.userId === selectedFriend.user.id &&
              tx.sharedInfo.borrowerId === currentUserId)),
      )
    : [];

  const groupTransactions = selectedGroup
    ? transactions.filter((tx) => tx.groupId === selectedGroup.id)
    : [];

  return (
    <div className="order-1 md:order-2 md:col-span-2 flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {selectedFriend && (
          <m.div
            key={`friend-detail-${selectedFriend.user.id}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
          >
            <FriendDetailCard
              selectedFriend={selectedFriend}
              onClear={onClearFriend}
              onOpenSharedExpense={onOpenSharedExpense}
              onOpenSettleDebt={onOpenSettleDebt}
              onOpenDeleteFriend={onOpenDeleteFriend}
              balances={balances}
              transactions={friendTransactions}
              currentUserId={currentUserId}
              displayCurrency={displayCurrency}
              convertNokAmount={convertNokAmount}
              convertCurrency={convertCurrency}
            />
          </m.div>
        )}

        {selectedGroup && (
          <m.div
            key={`group-detail-${selectedGroup.id}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
          >
            <GroupDetailCard
              selectedGroup={selectedGroup}
              onClear={onClearGroup}
              onOpenSharedExpense={onOpenSharedExpense}
              onOpenDeleteGroup={onOpenDeleteGroup}
              proposals={proposals}
              isProposalsLoading={isProposalsLoading}
              onSettle={onSettle}
              transactions={groupTransactions}
              currentUserId={currentUserId}
              displayCurrency={displayCurrency}
              convertNokAmount={convertNokAmount}
              convertCurrency={convertCurrency}
              allTransactions={transactions}
            />
          </m.div>
        )}

        {!selectedFriend && !selectedGroup && (
          <m.div
            key="friends-list-panel"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.3 }}
            className={cn(activeMobileTab !== "friends" && "hidden md:block")}
          >
            <FriendListPanel
              friends={friends}
              balances={balances}
              displayCurrency={displayCurrency}
              convertNokAmount={convertNokAmount}
              onSelectFriend={onSelectFriend}
              onSettleFriend={onOpenSettleDebt}
              onDeleteFriend={onOpenDeleteFriend}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
