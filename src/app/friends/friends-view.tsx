"use client";

import { Button, Card, CardContent, InputGroup } from "@heroui/react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  DollarSign,
  Handshake,
  Mail,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useDashboard } from "../../components/dashboard-layout";
import { LoadingState } from "../../components/ui/loading-state";
import { trpc } from "../../lib/trpc/client";
import { cn } from "../../lib/utils";

export default function FriendsView() {
  const { displayCurrency, exchangeRate } = useDashboard();

  const friendsQuery = trpc.friend.listFriends.useQuery();
  const pendingQuery = trpc.friend.listPendingRequests.useQuery();
  const balanceSummaryQuery = trpc.friend.getBalanceSummary.useQuery();

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
    },
  });

  const [emailInput, setEmailInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (
    friendsQuery.isLoading ||
    pendingQuery.isLoading ||
    balanceSummaryQuery.isLoading
  ) {
    return <LoadingState />;
  }

  const formatVal = (amount: number, currency: "EUR" | "NOK") => {
    return currency === "EUR"
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(amount)
      : new Intl.NumberFormat("no-NO", {
          style: "currency",
          currency: "NOK",
          minimumFractionDigits: 0,
        }).format(amount);
  };

  const convertNokAmount = (nokVal: number) => {
    return displayCurrency === "NOK" ? nokVal : nokVal / exchangeRate;
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-3 pb-24 md:pb-12 text-[var(--foreground)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none"
      >
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Users size={24} className="text-blue-500" />
            Spese Condivise & Amici
          </h2>
          <p className="text-[var(--text-muted)] text-xs">
            Aggiungi amici per dividere a metà le spese del tuo Erasmus
          </p>
        </div>
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
            bg: "bg-emerald-500/10 text-emerald-500",
            icon: <ArrowDownRight className="rotate-90" size={20} />,
            delay: 0.05,
          },
          {
            label: "Devi dare in totale",
            value: formatVal(convertNokAmount(totalYouOweNok), displayCurrency),
            color: "text-rose-500",
            bg: "bg-rose-500/10 text-rose-500",
            icon: <ArrowUpRight size={20} />,
            delay: 0.12,
          },
          {
            label: "Bilancio Netto Amici",
            value: formatVal(convertNokAmount(netBalanceNok), displayCurrency),
            color: netBalanceNok >= 0 ? "text-emerald-500" : "text-rose-500",
            bg:
              netBalanceNok >= 0
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500",
            icon:
              netBalanceNok >= 0 ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              ),
            delay: 0.19,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: stat.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="snap-start flex-shrink-0 w-[72vw] md:w-auto"
          >
            <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 apple-widget h-full select-none">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span
                    className={cn(
                      "text-xl font-black tracking-tight",
                      stat.color,
                    )}
                  >
                    {stat.value}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                    stat.bg,
                  )}
                >
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 apple-widget">
              <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full select-none">
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
                  className="flex flex-col gap-3.5"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                      Email dell&apos;Amico
                    </span>
                    <InputGroup className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-11 px-3 rounded-xl flex items-center border-0 w-full transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20">
                      <Mail
                        size={13}
                        className="text-neutral-500 mr-2 flex-shrink-0"
                      />
                      <InputGroup.Input
                        type="email"
                        placeholder="email@esempio.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                        className="text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full"
                      />
                    </InputGroup>
                  </div>

                  {errorMsg && (
                    <div className="text-[10px] font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                      {successMsg}
                    </div>
                  )}

                  <Button
                    type="submit"
                    isDisabled={sendRequestMutation.isPending}
                    className="bg-[var(--foreground)] text-[var(--background)] font-semibold text-xs h-11 rounded-xl cursor-pointer hover:opacity-90 shadow-sm"
                  >
                    Invia Richiesta
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.33, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-5 apple-widget">
              <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full select-none">
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
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider pl-1 select-none">
                    Ricevute
                  </span>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {!pendingQuery.data?.incoming ||
                    pendingQuery.data.incoming.length === 0 ? (
                      <span className="text-[10px] text-[var(--text-muted)] font-medium pl-1 py-1 select-none">
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
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider pl-1 select-none">
                    Inviate
                  </span>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {!pendingQuery.data?.outgoing ||
                    pendingQuery.data.outgoing.length === 0 ? (
                      <span className="text-[10px] text-[var(--text-muted)] font-medium pl-1 py-1 select-none">
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
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2"
        >
          <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget h-full flex flex-col">
            <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full select-none flex-shrink-0">
              <div className="flex gap-2.5 items-center">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
                  <UserCheck size={15} />
                </div>
                <span className="font-bold text-xs">I miei Amici</span>
              </div>
              {friendsQuery.data && friendsQuery.data.length > 0 && (
                <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                  {friendsQuery.data.length}{" "}
                  {friendsQuery.data.length === 1 ? "amico" : "amici"}
                </span>
              )}
            </div>

            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              {!friendsQuery.data || friendsQuery.data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-2 py-16 select-none">
                  <Users size={32} className="opacity-20" />
                  <span className="font-bold">
                    Non hai ancora nessun amico.
                  </span>
                  <span className="text-[10px] text-center max-w-[200px]">
                    Aggiungine uno digitando la sua email nella sezione a
                    sinistra!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1 max-h-[440px]">
                  {friendsQuery.data.map((friend) => {
                    const balanceObj = balances.find(
                      (b) => b.user.id === friend.user.id,
                    );
                    const balValue = balanceObj ? balanceObj.balanceNok : 0;
                    const isOwed = balValue > 0;
                    const hasBalance = Math.abs(balValue) >= 0.01;

                    return (
                      <div
                        key={friend.user.id}
                        className="flex justify-between items-center p-4 rounded-2xl bg-neutral-500/5 border border-[var(--card-border)] select-none flex-shrink-0"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
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

                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <div className="flex flex-col items-end">
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

                          {hasBalance && (
                            <Button
                              variant="outline"
                              className="font-bold text-[10px] h-8 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-0 rounded-xl px-3 flex items-center gap-1 cursor-pointer transition-all"
                              onPress={() => handleSettle(friend.user.id)}
                            >
                              <DollarSign size={11} /> Salda
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
