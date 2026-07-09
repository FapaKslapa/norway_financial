"use client";

import { useReducer, useRef, useMemo } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import {
  type FormState,
  type Friend,
  type Group,
  type SharedExpensePayload,
  type FormAction,
  type SplitMode,
} from "./types";

const initialFormState: FormState = {
  step: "form",
  shareType: "friend",
  desc: "",
  amount: "",
  currency: "EUR",
  date: "",
  friendId: "",
  splitMode: "half",
  percentage: "50",
  exactNok: "",
  n: "2",
  groupId: "",
  checkedMemberIds: [],
  groupSplitMode: "equal",
  customSplitsVal: {},
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    case "RESET":
      return { ...initialFormState, ...action.payload };
    default:
      return state;
  }
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

type UseSharedExpenseFormProps = {
  isOpen: boolean;
  onClose: () => void;
  friends: Friend[];
  groups: Group[];
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

export function useSharedExpenseForm({
  isOpen,
  onClose,
  friends,
  groups,
  onSave,
  onSaveGroupExpense,
  defaultGroupId,
  defaultFriendId,
}: UseSharedExpenseFormProps) {
  const {
    user: currentUser,
    displayCurrency,
    convertCurrency,
  } = useDashboard();
  const currentUserId = currentUser.id;

  const [state, dispatch] = useReducer(formReducer, {
    ...initialFormState,
    currency: displayCurrency,
  });

  const set = (payload: Partial<FormState>) =>
    dispatch({ type: "SET", payload });

  // ── Sync isOpen / defaults ──────────────────────────────────────────────────
  const prevIsOpenRef = useRef(false);
  if (isOpen !== prevIsOpenRef.current) {
    prevIsOpenRef.current = isOpen;
    if (isOpen) {
      if (defaultGroupId) {
        set({ shareType: "group", groupId: defaultGroupId });
      } else if (defaultFriendId) {
        set({ shareType: "friend", friendId: defaultFriendId });
      }
    }
  }

  // ── Sync members when group changes ─────────────────────────────────────────
  const prevGroupIdRef = useRef("");
  if (state.groupId !== prevGroupIdRef.current) {
    prevGroupIdRef.current = state.groupId;
    const grp = groups.find((g) => g.id === state.groupId);
    set({ checkedMemberIds: grp ? grp.members.map((m) => m.id) : [] });
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(state.amount);
  const hasAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const amountNok = hasAmount
    ? convertCurrency(parsedAmount, state.currency, "NOK")
    : 0;

  const checkedMemberIdsSet = useMemo(
    () => new Set(state.checkedMemberIds),
    [state.checkedMemberIds],
  );

  const selectedFriend = friends.find((f) => f.user.id === state.friendId);
  const selectedGroup = groups.find((g) => g.id === state.groupId);

  const splitValueNum =
    state.splitMode === "percentage"
      ? parseFloat(state.percentage) || 50
      : state.splitMode === "exact"
        ? parseFloat(state.exactNok) || amountNok / 2
        : state.splitMode === "custom_n"
          ? parseFloat(state.n) || 2
          : 0;

  const { myNok, friendNok } =
    amountNok > 0
      ? computeShares(amountNok, state.splitMode, splitValueNum)
      : { myNok: 0, friendNok: 0 };

  const myPct = amountNok > 0 ? (myNok / amountNok) * 100 : 50;
  const friendPct = amountNok > 0 ? (friendNok / amountNok) * 100 : 50;

  const checkedCount = state.checkedMemberIds.length;
  const groupShareNok = checkedCount > 0 ? amountNok / checkedCount : 0;

  const customSum = Object.entries(state.customSplitsVal)
    .filter(([id]) => checkedMemberIdsSet.has(id))
    .reduce((sum, [, val]) => sum + (parseFloat(val) || 0), 0);

  const customIsExact = Math.abs(customSum - parsedAmount) < 0.01;
  const customDifference = parsedAmount - customSum;

  const isGroupCustomValid =
    state.shareType === "group" && state.groupSplitMode === "custom"
      ? customIsExact
      : true;

  const canSave =
    hasAmount &&
    !!state.desc &&
    (state.shareType === "friend"
      ? !!state.friendId
      : !!state.groupId && checkedCount > 0 && isGroupCustomValid);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const resetForm = () =>
    dispatch({ type: "RESET", payload: { currency: displayCurrency } });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleToggleGroupSplitMode = (mode: "equal" | "custom") => {
    if (mode === "custom") {
      const initial: Record<string, string> = {};
      if (hasAmount && checkedCount > 0) {
        const equalShare = (parsedAmount / checkedCount).toFixed(2);
        for (const mId of state.checkedMemberIds) initial[mId] = equalShare;
      }
      set({ groupSplitMode: mode, customSplitsVal: initial });
    } else {
      set({ groupSplitMode: mode });
    }
  };

  const handleToggleMember = (mId: string) => {
    const isChecking = !state.checkedMemberIds.includes(mId);
    const nextChecked = isChecking
      ? [...state.checkedMemberIds, mId]
      : state.checkedMemberIds.filter((id) => id !== mId);

    let nextCustom = state.customSplitsVal;
    if (state.groupSplitMode === "custom") {
      nextCustom = { ...state.customSplitsVal };
      if (isChecking) {
        const currentSum = Object.values(nextCustom).reduce(
          (s, v) => s + (parseFloat(v) || 0),
          0,
        );
        const remaining = Math.max(0, parsedAmount - currentSum);
        nextCustom[mId] = remaining > 0 ? remaining.toFixed(2) : "0";
      } else {
        delete nextCustom[mId];
      }
    }
    set({ checkedMemberIds: nextChecked, customSplitsVal: nextCustom });
  };

  const handleChangeCustomSplit = (memberId: string, val: string) => {
    set({
      customSplitsVal: { ...state.customSplitsVal, [memberId]: val },
    });
  };

  const getSplitValue = (): number | undefined => {
    if (state.splitMode === "percentage")
      return parseFloat(state.percentage) || 50;
    if (state.splitMode === "exact")
      return parseFloat(state.exactNok) || undefined;
    if (state.splitMode === "custom_n") return parseFloat(state.n) || 2;
    return undefined;
  };

  const handleSave = async () => {
    if (!state.desc || !hasAmount) return;
    set({ step: "form" }); // prevent double-save via optimistic UI
    try {
      if (state.shareType === "group") {
        if (!state.groupId || checkedCount === 0) return;
        const activeMembers = (selectedGroup?.members || []).filter((m) =>
          checkedMemberIdsSet.has(m.id),
        );
        const groupSplits = activeMembers.flatMap((m) => {
          if (m.id === currentUserId) return [];
          const splitAmountNok =
            state.groupSplitMode === "custom"
              ? convertCurrency(
                  parseFloat(state.customSplitsVal[m.id]) || 0,
                  state.currency,
                  "NOK",
                )
              : groupShareNok;
          return [{ userId: m.id, amountNok: splitAmountNok }];
        });
        await onSaveGroupExpense({
          description: state.desc,
          amount: parsedAmount,
          currency: state.currency,
          date: state.date || new Date().toISOString(),
          groupId: state.groupId,
          groupSplits,
        });
      } else {
        if (!state.friendId) return;
        await onSave({
          description: state.desc,
          amount: parsedAmount,
          currency: state.currency,
          date: state.date || new Date().toISOString(),
          sharedWithUserId: state.friendId,
          splitMode: state.splitMode,
          splitValue: getSplitValue(),
        });
      }
      resetForm();
      onClose();
    } catch {
      // restore split step on error so the user can retry
      set({ step: "split" });
    }
  };

  // ── Split-step summary label ───────────────────────────────────────────────
  const splitSummaryLabel =
    state.shareType === "group"
      ? `Diviso per ${checkedCount} partecipanti`
      : state.splitMode === "half"
        ? "50 / 50"
        : state.splitMode === "thirds"
          ? "1/3 ciascuno"
          : state.splitMode === "percentage"
            ? `Tu ${100 - parseFloat(state.percentage || "50")}% / ${selectedFriend?.user.name} ${state.percentage}%`
            : state.splitMode === "exact"
              ? `${myNok.toFixed(0)} / ${friendNok.toFixed(0)} NOK`
              : `1/${state.n} ciascuno`;

  return {
    state,
    set,
    currentUser,
    currentUserId,
    displayCurrency,
    convertCurrency,
    parsedAmount,
    amountNok,
    selectedFriend,
    selectedGroup,
    myNok,
    friendNok,
    myPct,
    friendPct,
    checkedCount,
    groupShareNok,
    customIsExact,
    customDifference,
    canSave,
    handleClose,
    handleToggleGroupSplitMode,
    handleToggleMember,
    handleChangeCustomSplit,
    handleSave,
    splitSummaryLabel,
  };
}
