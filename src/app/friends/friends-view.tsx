"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronLeft,
  DollarSign,
  Folder,
  FolderPlus,
  Handshake,
  Mail,
  PieChart,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

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

import { useDashboard } from "@/components/dashboard-layout";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LoadingState } from "@/components/ui/loading-state";
import { StatCard } from "@/components/ui/stat-card";
import { trpc } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";
import type { SharedExpensePayload } from "./components/shared-expense-dialog";
import { SharedExpenseDialog } from "./components/shared-expense-dialog";

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

  const sendRequestMutation = trpc.friend.sendRequest.useMutation({
    onSuccess: () => {
      pendingQuery.refetch();
      setEmailInput("");
      setSuccessMsg("Richiesta inviata con successo!");
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Impossibile inviare la richiesta.");
      setSuccessMsg("");
    },
  });

  const respondRequestMutation = trpc.friend.respondRequest.useMutation({
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

  const createGroupMutation = trpc.group.create.useMutation({
    onSuccess: () => {
      groupsQuery.refetch();
      setIsCreateGroupOpen(false);
      setNewGroupName("");
      setSelectedGroupMemberIds([]);
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

  const [emailInput, setEmailInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isSharedExpenseOpen, setIsSharedExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<
    string[]
  >([]);

  const [selectedFriend, setSelectedFriend] = useState<FriendItem | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  const [friendToDelete, setFriendToDelete] = useState<FriendItem | null>(null);
  const [settleConfirmFriend, setSettleConfirmFriend] =
    useState<FriendItem | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GroupItem | null>(null);

  const convertNokAmount = (val: number | string): number => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return convertCurrency(num, "NOK", displayCurrency);
  };

  const formatVal = (val: number, curr: string) => {
    return formatCurrency(val, curr);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setErrorMsg("");
    setSuccessMsg("");
    await sendRequestMutation.mutateAsync({ email: emailInput.trim() });
  };

  const handleRespond = async (
    requestId: string,
    action: "accept" | "decline",
  ) => {
    await respondRequestMutation.mutateAsync({ requestId, action });
  };

  const handleSettle = async (friendId: string) => {
    await settleDebtMutation.mutateAsync({ friendId });
  };

  const handleDeleteFriend = async (friendId: string) => {
    await deleteFriendMutation.mutateAsync({ friendId });
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await createGroupMutation.mutateAsync({
      name: newGroupName.trim(),
      memberUserIds: selectedGroupMemberIds,
    });
  };

  const handleToggleMemberSelection = (friendId: string) => {
    setSelectedGroupMemberIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
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
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-3 pb-24 md:pb-12 text-[var(--foreground)] select-none">
      {}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Users size={24} className="text-blue-500" />
            Spese Condivise & Amici
          </h2>
          <p className="text-[var(--text-muted)] text-xs font-semibold">
            Gestisci la tua rubrica e dividi le spese con singoli amici o gruppi
          </p>
        </div>
        <Button
          variant="outline"
          className="font-bold text-xs bg-blue-500 text-white border-0 hover:bg-blue-600 rounded-xl px-4 h-10 flex items-center gap-1.5 cursor-pointer shadow-md flex-shrink-0"
          onPress={() => setIsSharedExpenseOpen(true)}
          isDisabled={!friendsQuery.data || friendsQuery.data.length === 0}
        >
          <Plus size={13} /> Aggiungi Spesa Condivisa
        </Button>
      </motion.div>
      {}
      <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-1 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {[
          {
            label: "Ti devono in totale",
            value: formatVal(
              convertNokAmount(totalYouAreOwedNok),
              displayCurrency,
            ),
            color: "text-emerald-500",
            icon: <ArrowDownRight className="rotate-90" size={16} />,
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
            delayIndex: 0,
          },
          {
            label: "Devi dare in totale",
            value: formatVal(convertNokAmount(totalYouOweNok), displayCurrency),
            color: "text-rose-500",
            icon: <ArrowUpRight size={16} />,
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
            className="w-[72vw] md:w-full flex-shrink-0 snap-start bg-[var(--card)] border border-[var(--card-border)] rounded-[2rem] p-5 shadow-[var(--card-shadow)]"
          />
        ))}
      </div>
      <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
        {}
        <div
          className={cn(
            "order-2 md:order-1 md:col-span-1 flex flex-col gap-6",
            (selectedFriend || selectedGroup) && "hidden md:flex",
          )}
        >
          {}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 rounded-[2rem]">
              <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full">
                <div className="flex gap-2.5 items-center">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
                    <UserPlus size={15} />
                  </div>
                  <span className="font-bold text-xs">Aggiungi Amico</span>
                </div>
              </div>

              <CardContent className="p-0">
                <form
                  onSubmit={handleInviteSubmit}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                      Email dell&apos;Amico
                    </span>
                    <div className="flex gap-2 items-center">
                      <div className="bg-neutral-100 dark:bg-zinc-800/40 border border-neutral-200 dark:border-zinc-800/50 focus-within:border-blue-500/50 h-11 px-3 rounded-2xl flex items-center gap-2 flex-1 transition-all duration-300">
                        <Mail
                          size={13}
                          className="text-[var(--text-muted)] flex-shrink-0"
                        />
                        <input
                          type="email"
                          placeholder="email@esempio.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          required
                          className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-[var(--text-muted)] min-w-0"
                        />
                      </div>
                      <Button
                        type="submit"
                        isIconOnly
                        isDisabled={sendRequestMutation.isPending}
                        className="bg-blue-500 hover:bg-blue-600 text-white h-11 w-11 rounded-2xl cursor-pointer shadow-sm border-0 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
                      >
                        <UserPlus size={15} />
                      </Button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="text-[10px] font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl text-center">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl text-center">
                      {successMsg}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.33, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 rounded-[2rem]">
              <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full">
                <div className="flex gap-2.5 items-center">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
                    <Handshake size={15} />
                  </div>
                  <span className="font-bold text-xs">Richieste Pendenti</span>
                </div>
                {(pendingQuery.data?.incoming?.length ?? 0) +
                  (pendingQuery.data?.outgoing?.length ?? 0) >
                  0 && (
                  <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">
                    {(pendingQuery.data?.incoming?.length ?? 0) +
                      (pendingQuery.data?.outgoing?.length ?? 0)}
                  </span>
                )}
              </div>

              <CardContent className="p-0 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider pl-1">
                    Ricevute
                  </span>
                  <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                    {!pendingQuery.data?.incoming ||
                    pendingQuery.data.incoming.length === 0 ? (
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold pl-1 py-1">
                        Nessuna richiesta ricevuta
                      </span>
                    ) : (
                      pendingQuery.data.incoming.map((req) => (
                        <div
                          key={req.id}
                          className="flex justify-between items-center p-2.5 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)] flex-shrink-0"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate text-[var(--foreground)]">
                              {req.user.name}
                            </span>
                            <span className="text-[9px] text-[var(--text-muted)] truncate">
                              {req.user.email}
                            </span>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              isIconOnly
                              variant="ghost"
                              className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/15 border-0 rounded-lg cursor-pointer"
                              onPress={() => handleRespond(req.id, "accept")}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              isIconOnly
                              variant="ghost"
                              className="h-7 w-7 text-rose-500 hover:bg-rose-500/15 border-0 rounded-lg cursor-pointer"
                              onPress={() => handleRespond(req.id, "decline")}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-[var(--card-border)] pt-3">
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider pl-1">
                    Inviate
                  </span>
                  <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                    {!pendingQuery.data?.outgoing ||
                    pendingQuery.data.outgoing.length === 0 ? (
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold pl-1 py-1">
                        Nessuna richiesta inviata
                      </span>
                    ) : (
                      pendingQuery.data.outgoing.map((req) => (
                        <div
                          key={req.id}
                          className="flex justify-between items-center p-2.5 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)] opacity-85 flex-shrink-0"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate text-[var(--foreground)]">
                              {req.user.name}
                            </span>
                            <span className="text-[9px] text-[var(--text-muted)] truncate">
                              {req.user.email}
                            </span>
                          </div>
                          <span className="text-[8px] font-black text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                            Pendente
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 rounded-[2rem]">
              <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full">
                <div className="flex gap-2.5 items-center">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
                    <Folder size={15} />
                  </div>
                  <span className="font-bold text-xs">Le mie Cartelle</span>
                </div>
                <Button
                  isIconOnly
                  variant="ghost"
                  className="h-7 w-7 text-blue-500 hover:bg-blue-500/10 border-0 rounded-xl cursor-pointer"
                  onPress={() => setIsCreateGroupOpen(true)}
                >
                  <FolderPlus size={14} />
                </Button>
              </div>

              <CardContent className="p-0 flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {!groupsQuery.data || groupsQuery.data.length === 0 ? (
                  <span className="text-[10px] text-[var(--text-muted)] font-semibold pl-1 py-1">
                    Nessuna cartella creata. Dividi le spese con più amici
                    creando un gruppo.
                  </span>
                ) : (
                  groupsQuery.data.map((group) => {
                    const isSelected = selectedGroup?.id === group.id;
                    return (
                      <button
                        type="button"
                        key={group.id}
                        onClick={() => {
                          setSelectedGroup(group);
                          setSelectedFriend(null);
                        }}
                        className={cn(
                          "flex justify-between items-center px-3.5 py-3 rounded-2xl border transition-all cursor-pointer text-left w-full bg-transparent outline-none",
                          isSelected
                            ? "bg-blue-500 text-white border-transparent shadow-md shadow-blue-500/15"
                            : "bg-neutral-500/5 border-[var(--card-border)] hover:bg-neutral-500/10 text-[var(--foreground)]",
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Folder
                            size={14}
                            className={
                              isSelected ? "text-white" : "text-blue-500"
                            }
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold truncate leading-none mb-0.5">
                              {group.name}
                            </span>
                            <span
                              className={cn(
                                "text-[8px] font-semibold",
                                isSelected
                                  ? "text-white/85"
                                  : "text-[var(--text-muted)]",
                              )}
                            >
                              {group.members.length} membri
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {}
        <div className="order-1 md:order-2 md:col-span-2 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {}
            {selectedFriend && (
              <motion.div
                key={`friend-detail-${selectedFriend.user.id}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 rounded-[2rem] flex flex-col">
                  {}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-[var(--card-border)] mb-5 gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Button
                        isIconOnly
                        variant="ghost"
                        className="h-8 w-8 text-[var(--text-muted)] hover:bg-neutral-500/10 rounded-xl cursor-pointer border-0 shrink-0"
                        onPress={() => setSelectedFriend(null)}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 text-base font-extrabold">
                        {selectedFriend.user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-[var(--foreground)] truncate leading-tight">
                          {selectedFriend.user.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                          {selectedFriend.user.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                      <Button
                        variant="outline"
                        className="font-bold text-[10px] h-8 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-0 rounded-xl px-3 flex items-center gap-1 cursor-pointer transition-all shrink-0"
                        onPress={() => setIsSharedExpenseOpen(true)}
                      >
                        <Plus size={11} /> Aggiungi Spesa
                      </Button>

                      {balances.find(
                        (b) => b.user.id === selectedFriend.user.id,
                      ) &&
                        Math.abs(
                          balances.find(
                            (b) => b.user.id === selectedFriend.user.id,
                          )?.balanceNok ?? 0,
                        ) >= 0.01 &&
                        (balances.find(
                          (b) => b.user.id === selectedFriend.user.id,
                        )?.balanceNok ?? 0) < 0 && (
                          <Button
                            variant="outline"
                            className="font-bold text-[10px] h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-0 rounded-xl px-3 flex items-center gap-1 cursor-pointer transition-all"
                            onPress={() =>
                              setSettleConfirmFriend(selectedFriend)
                            }
                          >
                            <DollarSign size={11} /> Salda
                          </Button>
                        )}
                      <Button
                        isIconOnly
                        variant="ghost"
                        className="h-8 w-8 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-0 shrink-0"
                        onPress={() => setFriendToDelete(selectedFriend)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {(() => {
                      const balObj = balances.find(
                        (b) => b.user.id === selectedFriend.user.id,
                      );
                      const balVal = balObj ? balObj.balanceNok : 0;
                      const hasBal = Math.abs(balVal) >= 0.01;

                      const title =
                        balVal > 0
                          ? "Ti deve"
                          : balVal < 0
                            ? "Gli devi"
                            : "Bilancio con l'amico";
                      const value = hasBal
                        ? `${balVal > 0 ? "+" : "-"}${formatVal(convertNokAmount(Math.abs(balVal)), displayCurrency)}`
                        : "In pari";
                      const subtitle = hasBal
                        ? `${Math.abs(balVal).toFixed(0)} NOK`
                        : "Nessun debito o credito";
                      const icon =
                        balVal > 0 ? (
                          <TrendingUp size={20} />
                        ) : balVal < 0 ? (
                          <TrendingDown size={20} />
                        ) : (
                          <Handshake size={20} />
                        );
                      const iconBgColor =
                        balVal > 0
                          ? "bg-emerald-500/10"
                          : balVal < 0
                            ? "bg-rose-500/10"
                            : "bg-neutral-500/10";
                      const iconColor =
                        balVal > 0
                          ? "text-emerald-500"
                          : balVal < 0
                            ? "text-rose-500"
                            : "text-[var(--text-muted)]";
                      const valColor =
                        balVal > 0
                          ? "text-emerald-500"
                          : balVal < 0
                            ? "text-rose-500"
                            : "text-[var(--text-muted)]";

                      return (
                        <StatCard
                          title={title}
                          value={value}
                          valueClassName={valColor}
                          subtitle={subtitle}
                          icon={icon}
                          iconBgColor={iconBgColor}
                          iconColor={iconColor}
                          delayIndex={0}
                        />
                      );
                    })()}

                    <StatCard
                      title="Spese Condivise"
                      value={
                        getFriendTransactions(selectedFriend.user.id).length
                      }
                      subtitle="Transazioni in comune"
                      icon={<Activity size={20} />}
                      iconBgColor="bg-blue-500/10"
                      iconColor="text-blue-500"
                      delayIndex={1}
                    />
                  </div>

                  {}
                  <div className="flex flex-col flex-1">
                    <h4 className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Activity size={12} className="opacity-60" />
                      Cronologia Spese in Comune
                    </h4>

                    <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 flex flex-col gap-2.5">
                      {getFriendTransactions(selectedFriend.user.id).length ===
                      0 ? (
                        <div className="text-center py-8 text-xs text-[var(--text-muted)] font-semibold">
                          Nessuna spesa condivisa registrata con questo amico.
                        </div>
                      ) : (
                        getFriendTransactions(selectedFriend.user.id).map(
                          (tx) => {
                            const isPayer = tx.userId === currentUserId;

                            const activeAmount = tx.sharedInfo
                              ? tx.sharedInfo.isBorrowed
                                ? convertCurrency(
                                    parseFloat(tx.sharedInfo.splitAmountNok),
                                    "NOK",
                                    displayCurrency,
                                  )
                                : convertCurrency(
                                    parseFloat(tx.amountNok) -
                                      parseFloat(tx.sharedInfo.splitAmountNok),
                                    "NOK",
                                    displayCurrency,
                                  )
                              : 0;

                            const originalAmount = convertCurrency(
                              parseFloat(tx.amountEur),
                              "EUR",
                              displayCurrency,
                            );

                            return (
                              <div
                                key={tx.id}
                                className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)]"
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
                                    {tx.description || "Spesa condivisa"}
                                  </span>
                                  <span className="text-[8px] text-[var(--text-muted)] font-semibold flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={9} />
                                      {new Date(tx.date).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {isPayer
                                        ? "Hai pagato tu"
                                        : `Ha pagato ${selectedFriend.user.name}`}
                                    </span>
                                    {tx.sharedInfo?.settled && (
                                      <>
                                        <span>•</span>
                                        <span className="text-emerald-500 font-bold">
                                          Saldata
                                        </span>
                                      </>
                                    )}
                                  </span>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                  <span
                                    className={cn(
                                      "text-xs font-black",
                                      tx.sharedInfo?.settled
                                        ? "text-[var(--text-muted)] line-through"
                                        : isPayer
                                          ? "text-emerald-500"
                                          : "text-rose-500",
                                    )}
                                  >
                                    {isPayer ? "+" : "-"}{" "}
                                    {formatVal(activeAmount, displayCurrency)}
                                  </span>
                                  <span className="text-[8px] text-[var(--text-muted)] font-semibold mt-0.5">
                                    Totale:{" "}
                                    {formatVal(originalAmount, displayCurrency)}
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        )
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {}
            {selectedGroup && (
              <motion.div
                key={`group-detail-${selectedGroup.id}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 rounded-[2rem] flex flex-col">
                  {}
                  <div className="flex justify-between items-center pb-5 border-b border-[var(--card-border)] mb-5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Button
                        isIconOnly
                        variant="ghost"
                        className="h-8 w-8 text-[var(--text-muted)] hover:bg-neutral-500/10 rounded-xl cursor-pointer border-0 shrink-0"
                        onPress={() => setSelectedGroup(null)}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Folder size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-[var(--foreground)] truncate leading-tight">
                          {selectedGroup.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                          {selectedGroup.members.length} partecipanti
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        className="font-bold text-[10px] h-8 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-0 rounded-xl px-3 flex items-center gap-1 cursor-pointer transition-all"
                        onPress={() => setIsSharedExpenseOpen(true)}
                      >
                        <Plus size={11} /> Aggiungi Spesa
                      </Button>
                      {selectedGroup.creatorId === currentUserId && (
                        <Button
                          isIconOnly
                          variant="ghost"
                          className="h-8 w-8 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-0 shrink-0"
                          onPress={() => setGroupToDelete(selectedGroup)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {}
                  <div className="mb-5">
                    <h4 className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Users size={12} className="opacity-60" />
                      Membri del Gruppo
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroup.members.map((m: GroupMember) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-500/5 border border-[var(--card-border)] text-xs font-semibold"
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

                  {}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatCard
                      title="Spese in Cartella"
                      value={getGroupTransactions(selectedGroup.id).length}
                      subtitle="Transazioni totali"
                      icon={<Activity size={20} />}
                      iconBgColor="bg-blue-500/10"
                      iconColor="text-blue-500"
                      delayIndex={0}
                    />

                    {(() => {
                      const txs = getGroupTransactions(selectedGroup.id);
                      const totalNok = txs.reduce(
                        (sum, tx) => sum + parseFloat(tx.amountNok),
                        0,
                      );
                      return (
                        <StatCard
                          title="Totale Speso nel Gruppo"
                          value={formatVal(
                            convertNokAmount(totalNok),
                            displayCurrency,
                          )}
                          subtitle={`${totalNok.toFixed(0)} NOK`}
                          icon={<PieChart size={20} />}
                          iconBgColor="bg-blue-500/10"
                          iconColor="text-blue-500"
                          valueClassName="text-blue-500"
                          delayIndex={1}
                        />
                      );
                    })()}
                  </div>

                  {}
                  <div className="flex flex-col flex-1">
                    <h4 className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Activity size={12} className="opacity-60" />
                      Cronologia Spese Gruppo
                    </h4>

                    <div className="flex-1 overflow-y-auto max-h-[200px] pr-1 flex flex-col gap-2.5">
                      {getGroupTransactions(selectedGroup.id).length === 0 ? (
                        <div className="text-center py-8 text-xs text-[var(--text-muted)] font-semibold">
                          Nessuna spesa inserita per questo gruppo.
                        </div>
                      ) : (
                        getGroupTransactions(selectedGroup.id).map((tx) => {
                          const isPayer = tx.userId === currentUserId;

                          let activeAmount = 0;
                          if (isPayer) {
                            const totalNok = parseFloat(tx.amountNok);
                            const totalOthersSplitsNok = (
                              transactionsQuery.data || []
                            )
                              .filter(
                                (t) =>
                                  t.id === tx.id &&
                                  t.sharedInfo &&
                                  t.sharedInfo.payerId === currentUserId,
                              )
                              .reduce(
                                (sum, t) =>
                                  sum +
                                  parseFloat(
                                    t.sharedInfo?.splitAmountNok ?? "0",
                                  ),
                                0,
                              );

                            const myShareNok = totalNok - totalOthersSplitsNok;
                            activeAmount = convertCurrency(
                              myShareNok,
                              "NOK",
                              displayCurrency,
                            );
                          } else {
                            const mySplit = (transactionsQuery.data || []).find(
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
                              className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)]"
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">
                                  {tx.description || "Spesa gruppo"}
                                </span>
                                <span className="text-[8px] text-[var(--text-muted)] font-semibold flex items-center gap-2 mt-1">
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
                                    isPayer
                                      ? "text-emerald-500"
                                      : "text-rose-500",
                                  )}
                                >
                                  {isPayer ? "+" : "-"}{" "}
                                  {formatVal(activeAmount, displayCurrency)}
                                </span>
                                <span className="text-[8px] text-[var(--text-muted)] font-semibold mt-0.5">
                                  Totale:{" "}
                                  {formatVal(originalAmount, displayCurrency)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {}
            {!selectedFriend && !selectedGroup && (
              <motion.div
                key="friends-list-panel"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 rounded-[2rem] h-full flex flex-col">
                  <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full flex-shrink-0">
                    <div className="flex gap-2.5 items-center">
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
                        <Users size={15} />
                      </div>
                      <span className="font-bold text-xs">Rubrica Amici</span>
                    </div>
                  </div>

                  <CardContent className="p-0 flex flex-col flex-1">
                    {!friendsQuery.data || friendsQuery.data.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-2 py-16">
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
                              className="relative flex justify-between items-center p-4 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)] hover:bg-neutral-500/10 transition-colors flex-shrink-0"
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
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25 flex items-center justify-center flex-shrink-0 text-sm font-extrabold">
                                  {friend.user.name.slice(0, 2).toUpperCase()}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-black text-[var(--foreground)] truncate">
                                    {friend.user.name}
                                  </span>
                                  <span className="text-[9px] text-[var(--text-muted)] truncate">
                                    {friend.user.email}
                                  </span>
                                </div>
                              </div>

                              <div className="relative z-10 flex items-center gap-3 ml-4 flex-shrink-0">
                                <div className="flex flex-col items-end pointer-events-none">
                                  {hasBalance ? (
                                    <>
                                      <span
                                        className={cn(
                                          "text-xs font-black tracking-tight",
                                          isOwed
                                            ? "text-emerald-500"
                                            : "text-rose-500",
                                        )}
                                      >
                                        {isOwed ? "Ti deve " : "Gli devi "}
                                        {formatVal(
                                          convertNokAmount(Math.abs(balValue)),
                                          displayCurrency,
                                        )}
                                      </span>
                                      <span className="text-[8px] text-[var(--text-muted)] font-semibold mt-0.5">
                                        {Math.abs(balValue).toFixed(0)} NOK
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-[var(--text-muted)] font-bold">
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
                                  className="text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 w-8 min-w-8 cursor-pointer flex items-center justify-center border-0 ml-1"
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
      {}
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
      ;{}
      <AnimatePresence>
        {isCreateGroupOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreateGroupOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-[var(--card-solid)] border border-[var(--card-border)] w-full max-w-[420px] rounded-3xl p-6 shadow-2xl text-[var(--foreground)] z-10 flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 flex-shrink-0">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <FolderPlus size={16} className="text-blue-500" />
                  Crea Nuova Cartella (Gruppo)
                </h3>
                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-[var(--text-muted)] rounded-xl hover:bg-neutral-500/10 h-8 w-8 border-0 cursor-pointer"
                  onPress={() => setIsCreateGroupOpen(false)}
                >
                  <X size={15} />
                </Button>
              </div>

              <form
                onSubmit={handleCreateGroup}
                className="flex flex-col gap-4 flex-1 overflow-hidden"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                    Nome della Cartella
                  </span>
                  <div className="bg-neutral-100 dark:bg-zinc-800/40 border border-neutral-200 dark:border-zinc-800/50 focus-within:border-blue-500/50 h-11 px-3 rounded-2xl flex items-center w-full transition-all">
                    <input
                      type="text"
                      placeholder="Es. Spese Convivenza, Festa Compleanno..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      required
                      className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-[var(--text-muted)] min-w-0"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1 select-none">
                    Seleziona Amici
                  </span>
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[200px]">
                    {!friendsQuery.data || friendsQuery.data.length === 0 ? (
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold p-1">
                        Devi aggiungere amici prima di poter creare una
                        cartella.
                      </span>
                    ) : (
                      friendsQuery.data.map((friend) => {
                        const checked = selectedGroupMemberIds.includes(
                          friend.user.id,
                        );
                        return (
                          <button
                            key={friend.user.id}
                            type="button"
                            onClick={() =>
                              handleToggleMemberSelection(friend.user.id)
                            }
                            className={cn(
                              "flex items-center gap-3.5 p-2.5 rounded-2xl border transition-all cursor-pointer text-left bg-transparent",
                              checked
                                ? "border-blue-500/30 bg-blue-500/5 text-[var(--foreground)]"
                                : "border-[var(--card-border)] hover:bg-neutral-500/5 text-[var(--foreground)]",
                            )}
                          >
                            <div
                              className={cn(
                                "h-5 w-5 rounded-md flex items-center justify-center border transition-all shrink-0",
                                checked
                                  ? "bg-blue-500 border-transparent text-white"
                                  : "border-[var(--card-border)] text-transparent",
                              )}
                            >
                              <Check size={12} className="stroke-[3]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold truncate leading-none mb-0.5">
                                {friend.user.name}
                              </span>
                              <span className="text-[8px] text-[var(--text-muted)] truncate">
                                {friend.user.email}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--card-border)] pt-4 mt-1 flex justify-end gap-2.5 flex-shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 text-xs font-bold text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl cursor-pointer flex-1"
                    onPress={() => setIsCreateGroupOpen(false)}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    isDisabled={
                      createGroupMutation.isPending || !newGroupName.trim()
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs h-10 rounded-xl cursor-pointer shadow-sm border-0 flex-1 disabled:opacity-50"
                  >
                    {createGroupMutation.isPending
                      ? "Creazione..."
                      : "Crea Cartella"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      ;{}
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
      ;{}
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
      ;{}
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
      ;
    </div>
  );
}
