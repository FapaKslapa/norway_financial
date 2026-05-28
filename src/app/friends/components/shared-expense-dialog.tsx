"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  CalendarDays,
  Check,
  ChevronRight,
  Hash,
  Minus,
  Percent,
  Ruler,
  SplitSquareHorizontal,
  Tag,
  Type,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CurrencySelect } from "@/components/ui/currency-select";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { CustomSelect } from "@/components/ui/custom-select";
import { MoneyInput } from "@/components/ui/money-input";
import { cn, formatCurrency } from "@/lib/utils";

type Friend = { user: { id: string; name: string } };
type SplitMode = "half" | "percentage" | "exact" | "thirds" | "custom_n";

export type SharedExpensePayload = {
  description: string;
  amount: number;
  currency: string;
  date: string;
  sharedWithUserId: string;
  splitMode: SplitMode;
  splitValue?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  groups: Array<{
    id: string;
    name: string;
    creatorId: string;
    members: Array<{ id: string; name: string; email: string }>;
  }>;
  onSave: (payload: SharedExpensePayload) => Promise<void>;
  onSaveGroupExpense: (payload: {
    description: string;
    amount: number;
    currency: string;
    date: string;
    groupId: string;
    groupSplits: Array<{ userId: string; amountNok: number }>;
  }) => Promise<void>;
  defaultGroupId?: string;
  defaultFriendId?: string;
};

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mb-1.5">
      <Icon size={11} className="opacity-60" />
      {children}
    </span>
  );
}

function computeShares(
  amountNok: number,
  mode: SplitMode,
  value: number,
): { myNok: number; friendNok: number } {
  let friendNok: number;
  switch (mode) {
    case "percentage":
      friendNok = amountNok * (value / 100);
      break;
    case "exact":
      friendNok = Math.min(value, amountNok);
      break;
    case "thirds":
      friendNok = amountNok / 3;
      break;
    case "custom_n":
      friendNok = amountNok / Math.max(value, 2);
      break;
    default:
      friendNok = amountNok / 2;
  }
  return { myNok: amountNok - friendNok, friendNok };
}

type SplitOption = {
  id: SplitMode;
  label: string;
  description: string;
  icon: React.ElementType;
};

const SPLIT_OPTIONS: SplitOption[] = [
  { id: "half", label: "Metà", description: "50% a testa", icon: Minus },
  {
    id: "percentage",
    label: "Percentuale",
    description: "Quota personalizzata",
    icon: Percent,
  },
  {
    id: "exact",
    label: "Importo esatto",
    description: "Cifra precisa",
    icon: Ruler,
  },
  {
    id: "thirds",
    label: "In terzi",
    description: "1/3 ciascuno",
    icon: SplitSquareHorizontal,
  },
  {
    id: "custom_n",
    label: "In N parti",
    description: "Dividi per N persone",
    icon: Hash,
  },
];

export function SharedExpenseDialog({
  isOpen,
  onClose,
  friends,
  groups,
  onSave,
  onSaveGroupExpense,
  defaultGroupId,
  defaultFriendId,
}: Props) {
  const {
    user: currentUser,
    displayCurrency,
    convertCurrency,
  } = useDashboard();
  const currentUserId = currentUser.id;

  const [step, setStep] = useState<"form" | "split">("form");
  const [shareType, setShareType] = useState<"friend" | "group">("friend");

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<string>(displayCurrency);
  const [date, setDate] = useState("");

  const [friendId, setFriendId] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("half");
  const [percentage, setPercentage] = useState("50");
  const [exactNok, setExactNok] = useState("");
  const [n, setN] = useState("2");

  const [groupId, setGroupId] = useState("");
  const [checkedMemberIds, setCheckedMemberIds] = useState<string[]>([]);
  const [groupSplitMode, setGroupSplitMode] = useState<"equal" | "custom">(
    "equal",
  );
  const [customSplitsVal, setCustomSplitsVal] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (isOpen) {
      if (defaultGroupId) {
        setShareType("group");
        setGroupId(defaultGroupId);
      } else if (defaultFriendId) {
        setShareType("friend");
        setFriendId(defaultFriendId);
      }
    }
  }, [isOpen, defaultGroupId, defaultFriendId]);

  const [isSaving, setIsSaving] = useState(false);

  const parsedAmount = parseFloat(amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const amountNok = hasAmount
    ? convertCurrency(parsedAmount, currency, "NOK")
    : 0;

  const showConversion = hasAmount && currency !== displayCurrency;
  const convertedAmount = showConversion
    ? convertCurrency(parsedAmount, currency, displayCurrency)
    : null;
  const targetCurrency = displayCurrency;

  const selectedFriend = friends.find((f) => f.user.id === friendId);
  const selectedGroup = groups.find((g) => g.id === groupId);

  useEffect(() => {
    if (selectedGroup) {
      setCheckedMemberIds(selectedGroup.members.map((m) => m.id));
    } else {
      setCheckedMemberIds([]);
    }
  }, [selectedGroup]);

  const splitValueNum =
    splitMode === "percentage"
      ? parseFloat(percentage) || 50
      : splitMode === "exact"
        ? parseFloat(exactNok) || amountNok / 2
        : splitMode === "custom_n"
          ? parseFloat(n) || 2
          : 0;

  const { myNok, friendNok } =
    amountNok > 0
      ? computeShares(amountNok, splitMode, splitValueNum)
      : { myNok: 0, friendNok: 0 };

  const myPct = amountNok > 0 ? (myNok / amountNok) * 100 : 50;
  const friendPct = amountNok > 0 ? (friendNok / amountNok) * 100 : 50;

  const checkedCount = checkedMemberIds.length;
  const groupShareNok = checkedCount > 0 ? amountNok / checkedCount : 0;

  const customSum = Object.entries(customSplitsVal)
    .filter(([id]) => checkedMemberIds.includes(id))
    .reduce((sum, [_, val]) => sum + (parseFloat(val) || 0), 0);

  const customIsExact = Math.abs(customSum - parsedAmount) < 0.01;
  const customDifference = parsedAmount - customSum;

  const getSplitValue = (): number | undefined => {
    if (splitMode === "percentage") return parseFloat(percentage) || 50;
    if (splitMode === "exact") return parseFloat(exactNok) || undefined;
    if (splitMode === "custom_n") return parseFloat(n) || 2;
    return undefined;
  };

  const isGroupCustomValid =
    shareType === "group" && groupSplitMode === "custom" ? customIsExact : true;

  const canSave =
    hasAmount &&
    !!desc &&
    (shareType === "friend"
      ? !!friendId
      : !!groupId && checkedCount > 0 && isGroupCustomValid);

  const resetForm = () => {
    setDesc("");
    setAmount("");
    setCurrency("EUR");
    setDate("");
    setFriendId("");
    setSplitMode("half");
    setPercentage("50");
    setExactNok("");
    setN("2");
    setStep("form");
    setShareType("friend");
    setCheckedMemberIds([]);
    setGroupId("");
    setGroupSplitMode("equal");
    setCustomSplitsVal({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleToggleGroupSplitMode = (mode: "equal" | "custom") => {
    setGroupSplitMode(mode);
    if (mode === "custom") {
      const initial: Record<string, string> = {};
      if (hasAmount && checkedCount > 0) {
        const equalShare = (parsedAmount / checkedCount).toFixed(2);
        for (const mId of checkedMemberIds) {
          initial[mId] = equalShare;
        }
      }
      setCustomSplitsVal(initial);
    }
  };

  const handleToggleMember = (mId: string) => {
    setCheckedMemberIds((prev) => {
      const isChecking = !prev.includes(mId);
      const nextChecked = isChecking
        ? [...prev, mId]
        : prev.filter((id) => id !== mId);
      if (groupSplitMode === "custom") {
        setCustomSplitsVal((prevVals) => {
          const nextVals = { ...prevVals };
          if (isChecking) {
            const currentSum = Object.entries(nextVals).reduce(
              (sum, [_, val]) => sum + (parseFloat(val) || 0),
              0,
            );
            const remaining = Math.max(0, parsedAmount - currentSum);
            nextVals[mId] = remaining > 0 ? remaining.toFixed(2) : "0";
          } else {
            delete nextVals[mId];
          }
          return nextVals;
        });
      }
      return nextChecked;
    });
  };

  const handleSave = async () => {
    if (!desc || !hasAmount) return;

    setIsSaving(true);
    try {
      if (shareType === "group") {
        if (!groupId || checkedCount === 0) return;
        const activeMembers = (selectedGroup?.members || []).filter((m) =>
          checkedMemberIds.includes(m.id),
        );

        const groupSplits = activeMembers
          .filter((m) => m.id !== currentUserId)
          .map((m) => {
            const splitAmountNok =
              groupSplitMode === "custom"
                ? convertCurrency(
                    parseFloat(customSplitsVal[m.id]) || 0,
                    currency,
                    "NOK",
                  )
                : groupShareNok;
            return {
              userId: m.id,
              amountNok: splitAmountNok,
            };
          });

        await onSaveGroupExpense({
          description: desc,
          amount: parsedAmount,
          currency,
          date: date || new Date().toISOString(),
          groupId,
          groupSplits,
        });
      } else {
        if (!friendId) return;
        await onSave({
          description: desc,
          amount: parsedAmount,
          currency,
          date: date || new Date().toISOString(),
          sharedWithUserId: friendId,
          splitMode,
          splitValue: getSplitValue(),
        });
      }
      resetForm();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-[var(--card-solid)] border border-[var(--card-border)] w-full md:max-w-[520px] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl text-[var(--foreground)] z-10 flex flex-col max-h-[92dvh] md:max-h-[88vh] mx-0 md:mx-4"
          >
            {}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--card-border)] flex-shrink-0">
              <div className="flex items-center gap-3">
                {step === "split" && (
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="h-7 w-7 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-neutral-500/10 cursor-pointer border-0 bg-transparent transition-all"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                  </button>
                )}
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <SplitSquareHorizontal size={15} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight">
                    {step === "form" ? "Spesa Condivisa" : "Divisione spesa"}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {step === "form"
                      ? "Aggiungi una spesa condivisa"
                      : shareType === "group"
                        ? `Gruppo: ${selectedGroup?.name}`
                        : selectedFriend
                          ? `con ${selectedFriend.user.name}`
                          : "Scegli modalità"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="h-7 w-7 text-[var(--text-muted)] rounded-xl hover:bg-neutral-500/10 border-0 cursor-pointer flex items-center justify-center bg-transparent transition-all"
                onClick={handleClose}
              >
                <X size={15} />
              </button>
            </div>

            {}
            <div className="flex items-center gap-2 px-6 pt-3 flex-shrink-0">
              <div className="h-1 flex-1 rounded-full bg-blue-500" />
              <div
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  step === "split" ? "bg-blue-500" : "bg-[var(--card-border)]",
                )}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {}
                {step === "form" && (
                  <motion.div
                    key="form-step"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pt-5 pb-6 flex flex-col gap-4"
                  >
                    {}
                    <div className="flex rounded-xl bg-neutral-100 dark:bg-zinc-800/30 p-1 w-full select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setShareType("friend");
                          setGroupId("");
                        }}
                        className={cn(
                          "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer bg-transparent",
                          shareType === "friend"
                            ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                            : "text-[var(--text-muted)]",
                        )}
                      >
                        Singolo Amico
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShareType("group");
                          setFriendId("");
                        }}
                        className={cn(
                          "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer bg-transparent",
                          shareType === "group"
                            ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                            : "text-[var(--text-muted)]",
                        )}
                      >
                        Gruppo / Cartella
                      </button>
                    </div>

                    {}
                    {shareType === "friend" ? (
                      <div>
                        <FieldLabel icon={Users}>
                          Amico con cui dividere
                        </FieldLabel>
                        <CustomSelect
                          value={friendId}
                          onChange={setFriendId}
                          placeholder="Seleziona amico..."
                          options={friends.map((f) => ({
                            value: f.user.id,
                            label: f.user.name,
                          }))}
                        />
                      </div>
                    ) : (
                      <div>
                        <FieldLabel icon={Users}>
                          Gruppo con cui dividere
                        </FieldLabel>
                        <CustomSelect
                          value={groupId}
                          onChange={setGroupId}
                          placeholder="Seleziona gruppo..."
                          options={groups.map((g) => ({
                            value: g.id,
                            label: g.name,
                          }))}
                        />
                      </div>
                    )}

                    {}
                    <div>
                      <FieldLabel icon={Type}>Descrizione</FieldLabel>
                      <div className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 h-11 px-3 rounded-xl flex items-center border border-[var(--card-border)] w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                        <input
                          type="text"
                          placeholder={
                            shareType === "group"
                              ? "Es. Spesa per festa, AirBnB..."
                              : "Es. Cena ristorante..."
                          }
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          className="text-sm text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full font-semibold placeholder:font-normal placeholder:text-[var(--text-muted)]"
                        />
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <FieldLabel icon={Wallet}>Importo totale</FieldLabel>
                        <MoneyInput
                          value={amount}
                          onChange={setAmount}
                          currency={currency}
                          required
                          className="h-11"
                          inputClassName="text-sm font-black"
                        />
                      </div>
                      <div>
                        <FieldLabel icon={ArrowLeftRight}>Valuta</FieldLabel>
                        <CurrencySelect
                          value={currency}
                          onChange={setCurrency}
                        />
                      </div>
                    </div>

                    {}
                    {convertedAmount !== null && (
                      <div className="flex items-center justify-between px-3 py-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
                          <ArrowLeftRight size={11} className="text-blue-500" />
                          Conversione stimata
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black">
                          <span className="text-[var(--text-muted)]">
                            {parsedAmount.toFixed(2)} {currency}
                          </span>
                          <span className="text-neutral-400">→</span>
                          <span className="text-blue-500">
                            {convertedAmount.toFixed(2)} {targetCurrency}
                          </span>
                        </div>
                      </div>
                    )}

                    {}
                    <div>
                      <FieldLabel icon={CalendarDays}>Data</FieldLabel>
                      <CustomDatePicker value={date} onChange={setDate} />
                    </div>

                    {}
                    {canSave && amountNok > 0 && (
                      <button
                        type="button"
                        onClick={() => setStep("split")}
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl hover:bg-blue-500/10 transition-all cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center flex-shrink-0">
                            <SplitSquareHorizontal size={13} />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-[var(--foreground)]">
                              Modalità divisione
                            </span>
                            <span className="text-[10px] text-blue-400 font-semibold">
                              {shareType === "group"
                                ? `Diviso per ${checkedCount} partecipanti`
                                : splitMode === "half"
                                  ? "50 / 50"
                                  : splitMode === "thirds"
                                    ? "1/3 ciascuno"
                                    : splitMode === "percentage"
                                      ? `Tu ${100 - parseFloat(percentage || "50")}% / ${selectedFriend?.user.name} ${percentage}%`
                                      : splitMode === "exact"
                                        ? `${myNok.toFixed(0)} / ${friendNok.toFixed(0)} NOK`
                                        : `1/${n} ciascuno`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold">
                            {shareType === "group" ? (
                              <span className="text-blue-500">
                                {formatCurrency(
                                  convertCurrency(
                                    groupShareNok,
                                    "NOK",
                                    displayCurrency,
                                  ),
                                  displayCurrency,
                                )}{" "}
                                a testa
                              </span>
                            ) : (
                              <>
                                <span className="text-blue-500">
                                  {myNok.toFixed(0)} NOK
                                </span>
                                <span className="text-[var(--text-muted)]">
                                  /
                                </span>
                                <span className="text-blue-500">
                                  {friendNok.toFixed(0)} NOK
                                </span>
                              </>
                            )}
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-[var(--text-muted)] group-hover:text-blue-400 transition-colors"
                          />
                        </div>
                      </button>
                    )}

                    {}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 h-12 text-xs font-bold text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl cursor-pointer bg-transparent transition-all"
                      >
                        Annulla
                      </button>
                      <button
                        type="button"
                        disabled={!canSave || isSaving}
                        onClick={handleSave}
                        className="flex-[2] h-12 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer shadow-sm border-0 disabled:opacity-50 transition-all"
                      >
                        {isSaving ? "Salvataggio..." : "Aggiungi Spesa"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {}
                {step === "split" && (
                  <motion.div
                    key="split-step"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pt-5 pb-6 flex flex-col gap-5"
                  >
                    {shareType === "friend" ? (
                      <>
                        {}
                        <div>
                          <FieldLabel icon={SplitSquareHorizontal}>
                            Modalità di divisione
                          </FieldLabel>
                          <div className="flex flex-col gap-1.5">
                            {SPLIT_OPTIONS.map((opt) => {
                              const Icon = opt.icon;
                              const active = splitMode === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSplitMode(opt.id)}
                                  className={cn(
                                    "flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all cursor-pointer text-left w-full",
                                    active
                                      ? "bg-blue-500/10 border-blue-500/30"
                                      : "bg-neutral-500/5 border-[var(--card-border)] hover:border-blue-500/20 hover:bg-blue-500/5",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                                      active
                                        ? "bg-blue-500 text-white"
                                        : "bg-neutral-500/10 text-[var(--text-muted)]",
                                    )}
                                  >
                                    <Icon size={14} />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span
                                      className={cn(
                                        "text-xs font-bold",
                                        active
                                          ? "text-[var(--foreground)]"
                                          : "text-[var(--text-muted)]",
                                      )}
                                    >
                                      {opt.label}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                      {opt.description}
                                    </span>
                                  </div>
                                  {active && (
                                    <ChevronRight
                                      size={14}
                                      className="text-blue-500 flex-shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {}
                        <AnimatePresence mode="wait">
                          {splitMode === "percentage" && (
                            <motion.div
                              key="pct"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <FieldLabel icon={Percent}>
                                Quota di {selectedFriend?.user.name} (%)
                              </FieldLabel>
                              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-500/5 rounded-2xl border border-[var(--card-border)]">
                                <input
                                  type="range"
                                  min="1"
                                  max="99"
                                  value={percentage}
                                  onChange={(e) =>
                                    setPercentage(e.target.value)
                                  }
                                  className="flex-1 accent-blue-500 cursor-pointer h-1.5"
                                />
                                <div className="flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5 min-w-[58px]">
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={percentage}
                                    onChange={(e) =>
                                      setPercentage(e.target.value)
                                    }
                                    className="w-8 bg-transparent border-0 outline-none text-sm font-black text-blue-500 text-center"
                                  />
                                  <Percent
                                    size={10}
                                    className="text-blue-400"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {splitMode === "exact" && (
                            <motion.div
                              key="exact"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <FieldLabel icon={Ruler}>
                                Importo a carico di {selectedFriend?.user.name}
                              </FieldLabel>
                              <div className="bg-neutral-500/5 h-11 px-3 rounded-xl flex items-center border border-[var(--card-border)] w-full focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={exactNok}
                                  onChange={(e) => setExactNok(e.target.value)}
                                  className="text-sm font-black text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none min-w-0 placeholder:text-[var(--text-muted)]"
                                />
                                <span className="text-[10px] text-[var(--text-muted)] font-bold ml-1 flex-shrink-0">
                                  NOK
                                </span>
                              </div>
                            </motion.div>
                          )}

                          {splitMode === "custom_n" && (
                            <motion.div
                              key="custom_n"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <FieldLabel icon={Hash}>
                                Numero totale di persone
                              </FieldLabel>
                              <div className="flex gap-2">
                                {[2, 3, 4, 5, 6].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setN(String(num))}
                                    className={cn(
                                      "flex-1 h-11 rounded-xl text-sm font-black border transition-all cursor-pointer",
                                      n === String(num)
                                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                        : "bg-neutral-500/5 text-[var(--foreground)] border-[var(--card-border)] hover:border-blue-500/30",
                                    )}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {}
                        {amountNok > 0 && (
                          <div className="flex flex-col gap-2">
                            <FieldLabel icon={Tag}>
                              Anteprima divisione
                            </FieldLabel>
                            <div className="flex h-2 rounded-full overflow-hidden gap-px">
                              <motion.div
                                className="bg-blue-500 rounded-l-full"
                                animate={{ width: `${myPct}%` }}
                                transition={{ duration: 0.3 }}
                              />
                              <motion.div
                                className="bg-blue-500 rounded-r-full"
                                animate={{ width: `${friendPct}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-wide">
                                    Tu paghi
                                  </span>
                                </div>
                                <span className="text-base font-black text-blue-500">
                                  {formatCurrency(
                                    convertCurrency(
                                      myNok,
                                      "NOK",
                                      displayCurrency,
                                    ),
                                    displayCurrency,
                                  )}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-wide truncate">
                                    {selectedFriend?.user.name ?? "Amico"}
                                  </span>
                                </div>
                                <span className="text-base font-black text-blue-500">
                                  {formatCurrency(
                                    convertCurrency(
                                      friendNok,
                                      "NOK",
                                      displayCurrency,
                                    ),
                                    displayCurrency,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {}
                        <div>
                          <FieldLabel icon={Users}>
                            Partecipanti nel Gruppo
                          </FieldLabel>
                          <p className="text-[10px] text-[var(--text-muted)] -mt-1.5 mb-2.5">
                            Seleziona chi partecipa a questa spesa.
                          </p>

                          <div className="flex p-1 bg-neutral-500/5 rounded-xl border border-[var(--card-border)] mb-3 select-none">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleGroupSplitMode("equal")
                              }
                              className={cn(
                                "flex-1 text-[10px] py-1.5 font-bold rounded-lg transition-all border-0 cursor-pointer",
                                groupSplitMode === "equal"
                                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                                  : "text-[var(--text-muted)] bg-transparent hover:bg-neutral-500/10",
                              )}
                            >
                              Uguale
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleGroupSplitMode("custom")
                              }
                              className={cn(
                                "flex-1 text-[10px] py-1.5 font-bold rounded-lg transition-all border-0 cursor-pointer",
                                groupSplitMode === "custom"
                                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                                  : "text-[var(--text-muted)] bg-transparent hover:bg-neutral-500/10",
                              )}
                            >
                              Personalizzato
                            </button>
                          </div>

                          <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1">
                            {selectedGroup?.members.map((member) => {
                              const checked = checkedMemberIds.includes(
                                member.id,
                              );
                              const isMe = member.id === currentUserId;
                              return (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => handleToggleMember(member.id)}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left bg-transparent",
                                    checked
                                      ? "border-blue-500/30 bg-blue-500/5"
                                      : "border-[var(--card-border)] hover:bg-neutral-500/5",
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={cn(
                                        "h-5 w-5 rounded-md flex items-center justify-center border transition-all",
                                        checked
                                          ? "bg-blue-500 border-transparent text-white"
                                          : "border-[var(--card-border)] text-transparent",
                                      )}
                                    >
                                      <Check size={12} className="stroke-[3]" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-bold text-[var(--foreground)] truncate">
                                        {member.name} {isMe && "(Tu)"}
                                      </span>
                                    </div>
                                  </div>
                                  {checked && (
                                    <button
                                      type="button"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1.5 cursor-default bg-transparent border-0 p-0"
                                    >
                                      {groupSplitMode === "custom" ? (
                                        <div className="flex items-center gap-1 bg-neutral-500/5 px-2 py-1 rounded-lg border border-[var(--card-border)]">
                                          <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                              customSplitsVal[member.id] || ""
                                            }
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setCustomSplitsVal((prev) => ({
                                                ...prev,
                                                [member.id]: val,
                                              }));
                                            }}
                                            className="w-16 text-right text-[11px] font-black bg-transparent border-0 outline-none text-[var(--foreground)] p-0"
                                            placeholder="0.00"
                                          />
                                          <span className="text-[9px] text-[var(--text-muted)] font-black">
                                            {currency}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] font-black text-blue-500 shrink-0">
                                          {formatCurrency(
                                            convertCurrency(
                                              groupShareNok,
                                              "NOK",
                                              displayCurrency,
                                            ),
                                            displayCurrency,
                                          )}
                                        </span>
                                      )}
                                    </button>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {amountNok > 0 && checkedCount > 0 && (
                          <div className="flex flex-col gap-2 p-3 bg-neutral-500/5 border border-[var(--card-border)] rounded-2xl">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                                Riepilogo Split ({checkedCount} persone)
                              </span>
                              {groupSplitMode === "custom" && (
                                <span
                                  className={cn(
                                    "text-[9px] font-black px-1.5 py-0.5 rounded",
                                    customIsExact
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : "bg-red-500/10 text-red-500",
                                  )}
                                >
                                  {customIsExact
                                    ? "Assegnato correttamente"
                                    : `Residuo: ${formatCurrency(customDifference, currency)}`}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5 text-xs font-bold max-h-[100px] overflow-y-auto pr-1">
                              {selectedGroup?.members
                                .filter((m) => checkedMemberIds.includes(m.id))
                                .map((m) => {
                                  const displayVal =
                                    groupSplitMode === "custom"
                                      ? parseFloat(customSplitsVal[m.id]) || 0
                                      : convertCurrency(
                                          groupShareNok,
                                          "NOK",
                                          currency,
                                        );
                                  return (
                                    <div
                                      key={m.id}
                                      className="flex justify-between items-center text-[11px]"
                                    >
                                      <span className="text-[var(--text-muted)]">
                                        {m.id === currentUserId
                                          ? "Tua quota (Tu paghi)"
                                          : m.name}
                                      </span>
                                      <span className="text-blue-500">
                                        {formatCurrency(displayVal, currency)}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {}
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="flex-1 h-11 text-xs font-bold text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-xl cursor-pointer bg-transparent transition-all"
                      >
                        Indietro
                      </button>
                      <button
                        type="button"
                        disabled={
                          isSaving ||
                          (shareType === "group" && checkedCount === 0)
                        }
                        onClick={handleSave}
                        className="flex-[2] h-11 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer shadow-sm border-0 disabled:opacity-50"
                      >
                        {isSaving ? "Salvataggio..." : "Aggiungi Spesa"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
