"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { StatCard } from "@/components/ui/stat-card";
import { trpc } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";

import { AddFriendCard } from "./components/add-friend-card";
import { AmountWithTooltip } from "./components/amount-with-tooltip";
import { CreateGroupModal } from "./components/create-group-modal";
import { FriendDetailCard } from "./components/friend-detail-card";
import { GroupDetailCard } from "./components/group-detail-card";
import { GroupListCard } from "./components/group-list-card";
import { PendingRequestsCard } from "./components/pending-requests-card";
import {
  SharedExpenseDialog,
  type SharedExpensePayload,
} from "./components/shared-expense-dialog";

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
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

export default function FriendsView() {
  const {
    displayCurrency,
    convertCurrency,
    rates,
    user: currentUser,
  } = useDashboard();
  const currentUserId = currentUser.id;

  const friendsQuery = trpc.friend.listFriends.useQuery();
  const pendingQuery = trpc.friend.listPendingRequests.useQuery();
  const balanceSummaryQuery = trpc.friend.getBalanceSummary.useQuery();
  const groupsQuery = trpc.group.list.useQuery();
  const transactionsQuery = trpc.transaction.list.useQuery();

  const _respondRequestMutation = trpc.friend.respondRequest.useMutation({
    onSuccess: () => {
      pendingQuery.refetch();
      friendsQuery.refetch();
      balanceSummaryQuery.refetch();
    },
  });

  const settleDebtMutation = trpc.friend.settleDebt.useMutation({
    onSuccess: () => {
      balanceSummaryQuery.refetch();
      transactionsQuery.refetch();
      proposalsQuery.refetch();
    },
  });

  const deleteFriendMutation = trpc.friend.deleteFriend.useMutation({
    onSuccess: () => {
      friendsQuery.refetch();
      balanceSummaryQuery.refetch();
      if (selectedFriend) {
        setSelectedFriend(null);
      }
    },
  });

  const deleteGroupMutation = trpc.group.delete.useMutation({
    onSuccess: () => {
      groupsQuery.refetch();
      setSelectedGroup(null);
    },
  });

  const createTransactionMutation = trpc.transaction.create.useMutation({
    onSuccess: () => {
      balanceSummaryQuery.refetch();
      transactionsQuery.refetch();
    },
  });

  const [activeMobileTab, setActiveMobileTab] = useState<
    "friends" | "groups" | "manage"
  >("friends");
  const [isSharedExpenseOpen, setIsSharedExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  const [friendToDelete, setFriendToDelete] = useState<FriendItem | null>(null);
  const [settleConfirmFriend, setSettleConfirmFriend] =
    useState<FriendItem | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupItem | null>(null);

  const proposalsQuery = trpc.friend.getGroupSettlementProposals.useQuery(
    { groupId: selectedGroup?.id || null },
    { enabled: !!selectedGroup?.id },
  );

  const convertNokAmount = (val: number | string): number => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return convertCurrency(num, "NOK", displayCurrency);
  };

  const formatVal = (val: number, curr: string) => {
    return formatCurrency(val, curr);
  };

  const handleRespondSuccess = () => {
    pendingQuery.refetch();
    friendsQuery.refetch();
    balanceSummaryQuery.refetch();
  };

  const handleSettle = async (friendId: string) => {
    await settleDebtMutation.mutateAsync({ friendId });
  };

  const handleDeleteFriend = async (friendId: string) => {
    await deleteFriendMutation.mutateAsync({ friendId });
  };

  const handleSharedExpense = async (payload: SharedExpensePayload) => {
    await createTransactionMutation.mutateAsync({
      description: payload.description,
      type: "expense",
      amount: payload.amount,
      currency: payload.currency,
      exchangeRate: rates[payload.currency] ?? 1,
      exchangeRateNok: rates.NOK ?? 11.85,
      categoryId: null,
      date: payload.date,
      sharedWithUserId: payload.sharedWithUserId,
      splitMode: payload.splitMode,
      splitValue: payload.splitValue,
    });
  };

  const handleGroupExpense = async (payload: {
    description: string;
    amount: number;
    currency: string;
    date: string;
    groupId: string;
    groupSplits: Array<{ userId: string; amountNok: number }>;
  }) => {
    await createTransactionMutation.mutateAsync({
      description: payload.description,
      type: "expense",
      amount: payload.amount,
      currency: payload.currency,
      exchangeRate: rates[payload.currency] ?? 1,
      exchangeRateNok: rates.NOK ?? 11.85,
      categoryId: null,
      date: payload.date,
      groupId: payload.groupId,
      groupSplits: payload.groupSplits,
    });
  };

  if (
    friendsQuery.isLoading ||
    pendingQuery.isLoading ||
    balanceSummaryQuery.isLoading ||
    groupsQuery.isLoading ||
    transactionsQuery.isLoading
  ) {
    return <LoadingState />;
  }

  const balances = balanceSummaryQuery.data || [];

  const totalYouAreOwedNok = balances
    .filter((b) => b.balanceNok > 0)
    .reduce((sum, b) => sum + b.balanceNok, 0);

  const totalYouOweNok = Math.abs(
    balances
      .filter((b) => b.balanceNok < 0)
      .reduce((sum, b) => sum + b.balanceNok, 0),
  );

  const netBalanceNok = totalYouAreOwedNok - totalYouOweNok;

  const getFriendTransactions = (fId: string) => {
    return (transactionsQuery.data || []).filter((tx) => {
      return (
        tx.sharedInfo &&
        ((tx.userId === currentUserId && tx.sharedInfo.borrowerId === fId) ||
          (tx.userId === fId && tx.sharedInfo.borrowerId === currentUserId))
      );
    });
  };

  const getGroupTransactions = (gId: string) => {
    return (transactionsQuery.data || []).filter((tx) => tx.groupId === gId);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-3 pb-24 md:pb-12 text-foreground select-none">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-row justify-between items-center gap-4 w-full"
      >
        <div>
          <h2 className="text-lg md:text-2xl font-black tracking-tight flex items-center gap-1.5 md:gap-2">
            <Users
              size={18}
              className="text-blue-500 md:w-[24px] md:h-[24px]"
            />
            <span>Amici & Spese</span>
          </h2>
          <p className="text-(--text-muted) text-xs font-semibold hidden md:block">
            Gestisci la tua rubrica e dividi le spese con singoli amici o gruppi
          </p>
        </div>
        <Button
          variant="outline"
          className="font-bold text-xs bg-blue-500 text-white border-0 hover:bg-blue-600 rounded-xl h-9 md:h-10 px-3 md:px-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
          onPress={() => setIsSharedExpenseOpen(true)}
          isDisabled={!friendsQuery.data || friendsQuery.data.length === 0}
        >
          <Plus size={13} />
          <span className="hidden sm:inline">Aggiungi Spesa Condivisa</span>
          <span className="sm:hidden">Nuova Spesa</span>
        </Button>
      </motion.div>

      <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-1 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {[
          {
            label: "Ti devono in totale",
            value: formatVal(
              convertNokAmount(totalYouAreOwedNok),
              displayCurrency,
            ),
            color: "text-emerald-500",
            icon: <TrendingUp className="rotate-90" size={16} />,
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
            delayIndex: 0,
          },
          {
            label: "Devi dare in totale",
            value: formatVal(convertNokAmount(totalYouOweNok), displayCurrency),
            color: "text-rose-500",
            icon: <TrendingDown size={16} />,
            iconBg: "bg-rose-500/10",
            iconColor: "text-rose-500",
            delayIndex: 1,
          },
          {
            label: "Bilancio Netto Amici",
            value: formatVal(convertNokAmount(netBalanceNok), displayCurrency),
            color: netBalanceNok >= 0 ? "text-emerald-500" : "text-rose-500",
            icon:
              netBalanceNok >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              ),
            iconBg: netBalanceNok >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
            iconColor:
              netBalanceNok >= 0 ? "text-emerald-500" : "text-rose-500",
            delayIndex: 2,
          },
        ].map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            valueClassName={stat.color}
            icon={stat.icon}
            iconBgColor={stat.iconBg}
            iconColor={stat.iconColor}
            delayIndex={stat.delayIndex}
            className="w-[85vw] md:w-full shrink-0 snap-start scroll-ml-4 bg-(--card) border border-(--card-border) rounded-[2rem] p-5 shadow-(--card-shadow)"
          />
        ))}
      </div>

      <div
        className={cn(
          "flex md:hidden rounded-[1.25rem] bg-neutral-500/5 dark:bg-zinc-800/20 border border-(--card-border) p-1 w-full shrink-0 select-none",
          (selectedFriend || selectedGroup) && "hidden",
        )}
      >
        <button
          type="button"
          onClick={() => setActiveMobileTab("friends")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
            activeMobileTab === "friends"
              ? "bg-foreground text-background shadow-sm"
              : "text-(--text-muted) hover:text-foreground",
          )}
        >
          Amici
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("groups")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent",
            activeMobileTab === "groups"
              ? "bg-foreground text-background shadow-sm"
              : "text-(--text-muted) hover:text-foreground",
          )}
        >
          Gruppi
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("manage")}
          className={cn(
            "flex-1 py-2 text-xs font-extrabold rounded-[0.9rem] transition-all border-0 cursor-pointer bg-transparent flex items-center justify-center gap-1",
            activeMobileTab === "manage"
              ? "bg-foreground text-background shadow-sm"
              : "text-(--text-muted) hover:text-foreground",
          )}
        >
          Gestisci
          {(pendingQuery.data?.incoming?.length ?? 0) +
            (pendingQuery.data?.outgoing?.length ?? 0) >
            0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
        <div
          className={cn(
            "order-2 md:order-1 md:col-span-1 flex flex-col gap-6",
            (selectedFriend || selectedGroup) && "hidden md:flex",
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className={cn(activeMobileTab !== "manage" && "hidden md:block")}
          >
            <AddFriendCard onSuccess={() => pendingQuery.refetch()} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.33, ease: [0.16, 1, 0.3, 1] }}
            className={cn(activeMobileTab !== "manage" && "hidden md:block")}
          >
            <PendingRequestsCard
              incomingRequests={pendingQuery.data?.incoming ?? []}
              outgoingRequests={pendingQuery.data?.outgoing ?? []}
              onActionSuccess={handleRespondSuccess}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(activeMobileTab !== "groups" && "hidden md:block")}
          >
            <GroupListCard
              groups={groupsQuery.data ?? []}
              selectedGroupId={selectedGroup?.id}
              onSelectGroup={setSelectedGroup}
              onClearFriend={() => setSelectedFriend(null)}
              onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
            />
          </motion.div>
        </div>

        <div className="order-1 md:order-2 md:col-span-2 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {selectedFriend && (
              <motion.div
                key={`friend-detail-${selectedFriend.user.id}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
              >
                <FriendDetailCard
                  selectedFriend={selectedFriend}
                  onClear={() => setSelectedFriend(null)}
                  onOpenSharedExpense={() => setIsSharedExpenseOpen(true)}
                  onOpenSettleDebt={setSettleConfirmFriend}
                  onOpenDeleteFriend={setFriendToDelete}
                  balances={balances}
                  transactions={getFriendTransactions(selectedFriend.user.id)}
                  currentUserId={currentUserId}
                  displayCurrency={displayCurrency}
                  convertNokAmount={convertNokAmount}
                  convertCurrency={convertCurrency}
                />
              </motion.div>
            )}

            {selectedGroup && (
              <motion.div
                key={`group-detail-${selectedGroup.id}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
              >
                <GroupDetailCard
                  selectedGroup={selectedGroup}
                  onClear={() => setSelectedGroup(null)}
                  onOpenSharedExpense={() => setIsSharedExpenseOpen(true)}
                  onOpenDeleteGroup={setGroupToDelete}
                  proposals={proposalsQuery.data ?? []}
                  isProposalsLoading={proposalsQuery.isLoading}
                  onSettle={handleSettle}
                  transactions={getGroupTransactions(selectedGroup.id)}
                  currentUserId={currentUserId}
                  displayCurrency={displayCurrency}
                  convertNokAmount={convertNokAmount}
                  convertCurrency={convertCurrency}
                  allTransactions={transactionsQuery.data ?? []}
                />
              </motion.div>
            )}

            {!selectedFriend && !selectedGroup && (
              <motion.div
                key="friends-list-panel"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  activeMobileTab !== "friends" && "hidden md:block",
                )}
              >
                <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-6 rounded-[2rem] h-full flex flex-col">
                  <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-(--card-border) mb-4 w-full shrink-0">
                    <div className="flex gap-2.5 items-center">
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
                        <Users size={15} />
                      </div>
                      <span className="font-bold text-xs">Rubrica Amici</span>
                    </div>
                  </div>

                  <CardContent className="p-0 flex flex-col flex-1">
                    {!friendsQuery.data || friendsQuery.data.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-xs text-(--text-muted) gap-2 py-16">
                        <Users size={32} className="opacity-20" />
                        <span className="font-bold">
                          Non hai ancora nessun amico.
                        </span>
                        <span className="text-[10px] text-center max-w-[200px] font-semibold leading-normal">
                          Aggiungine uno digitando la sua email nella sezione a
                          sinistra!
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 max-h-[440px]">
                        {friendsQuery.data.map((friend) => {
                          const balanceObj = balances.find(
                            (b) => b.user.id === friend.user.id,
                          );
                          const balValue = balanceObj
                            ? balanceObj.balanceNok
                            : 0;
                          const isOwed = balValue > 0;
                          const hasBalance = Math.abs(balValue) >= 0.01;

                          return (
                            <div
                              key={friend.user.id}
                              className="relative flex justify-between items-center p-4 rounded-2xl bg-neutral-500/5 border border-(--card-border) hover:bg-neutral-500/10 transition-colors shrink-0"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFriend(friend);
                                  setSelectedGroup(null);
                                }}
                                className="absolute inset-0 rounded-2xl border-0 bg-transparent cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                                aria-label={friend.user.name}
                              />

                              <div className="relative z-10 flex items-center gap-3.5 min-w-0 pointer-events-none">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25 flex items-center justify-center shrink-0 text-sm font-extrabold">
                                  {friend.user.name.slice(0, 2).toUpperCase()}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-black text-foreground truncate">
                                    {friend.user.name}
                                  </span>
                                  <span className="text-[9px] text-(--text-muted) truncate">
                                    {friend.user.email}
                                  </span>
                                </div>
                              </div>

                              <div className="relative z-10 flex items-center gap-3 ml-4 shrink-0">
                                <div className="flex flex-col items-end pointer-events-none">
                                  {hasBalance ? (
                                    <>
                                      <AmountWithTooltip
                                        amount={convertNokAmount(
                                          Math.abs(balValue),
                                        )}
                                        currency={displayCurrency}
                                        prefix={
                                          isOwed ? "Ti deve " : "Gli devi "
                                        }
                                        className={cn(
                                          "text-xs font-black tracking-tight pointer-events-auto",
                                          isOwed
                                            ? "text-emerald-500"
                                            : "text-rose-500",
                                        )}
                                      />
                                      <span className="text-[8px] text-(--text-muted) font-semibold mt-0.5">
                                        {Math.abs(balValue).toFixed(0)} NOK
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-(--text-muted) font-bold">
                                      Bilancio in pari
                                    </span>
                                  )}
                                </div>

                                {hasBalance && !isOwed && (
                                  <Button
                                    variant="outline"
                                    className="font-bold text-[10px] h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-0 rounded-xl px-3 flex items-center gap-1 cursor-pointer transition-all"
                                    onPress={() =>
                                      setSettleConfirmFriend(friend)
                                    }
                                  >
                                    <DollarSign size={11} /> Salda
                                  </Button>
                                )}

                                <Button
                                  isIconOnly
                                  variant="ghost"
                                  size="sm"
                                  className="text-(--text-muted) hover:text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 w-8 min-w-8 cursor-pointer flex items-center justify-center border-0 ml-1"
                                  onPress={() => setFriendToDelete(friend)}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SharedExpenseDialog
        isOpen={isSharedExpenseOpen}
        onClose={() => setIsSharedExpenseOpen(false)}
        friends={
          friendsQuery.data?.map((f) => ({
            user: { id: f.user.id, name: f.user.name },
          })) ?? []
        }
        groups={groupsQuery.data || []}
        onSave={handleSharedExpense}
        onSaveGroupExpense={handleGroupExpense}
        defaultGroupId={selectedGroup?.id}
        defaultFriendId={selectedFriend?.user.id}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        friends={friendsQuery.data ?? []}
        onSuccess={() => groupsQuery.refetch()}
      />

      <ConfirmationDialog
        isOpen={friendToDelete !== null}
        onClose={() => setFriendToDelete(null)}
        onConfirm={async () => {
          if (friendToDelete) {
            await handleDeleteFriend(friendToDelete.user.id);
          }
        }}
        title="Rimuovi Amico"
        message={`Sei sicuro di voler rimuovere ${friendToDelete?.user.name} dai tuoi amici? Questo non cancellerà le transazioni passate ma non potrete più condividere nuove spese.`}
        confirmLabel="Rimuovi"
        cancelLabel="Annulla"
        isDestructive={true}
      />

      <ConfirmationDialog
        isOpen={settleConfirmFriend !== null}
        onClose={() => setSettleConfirmFriend(null)}
        onConfirm={async () => {
          if (settleConfirmFriend) {
            await handleSettle(settleConfirmFriend.user.id);
          }
        }}
        title="Conferma Saldo"
        message={`Sei sicuro di voler saldare il debito con ${settleConfirmFriend?.user.name}? Verrà registrata una transazione di saldo.`}
        confirmLabel="Salda"
        cancelLabel="Annulla"
        isDestructive={false}
      />

      <ConfirmationDialog
        isOpen={groupToDelete !== null}
        onClose={() => setGroupToDelete(null)}
        onConfirm={async () => {
          if (groupToDelete) {
            await deleteGroupMutation.mutateAsync({
              groupId: groupToDelete.id,
            });
          }
        }}
        title="Elimina Cartella"
        message={`Sei sicuro di voler eliminare la cartella "${groupToDelete?.name}"? I membri ed i bilanci storici rimarranno intatti, ma il gruppo verrà rimosso.`}
        confirmLabel="Elimina"
        cancelLabel="Annulla"
        isDestructive={true}
      />
    </div>
  );
}
