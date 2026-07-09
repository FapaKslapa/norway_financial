"use client";

import { AnimatePresence, m } from "framer-motion";
import { cn } from "@/lib/utils";
import { DialogHeader } from "./shared-expense/dialog-header";
import { SharedExpenseFormStep } from "./shared-expense/form-step";
import { SharedExpenseSplitStep } from "./shared-expense/split-step";
import type {
  Friend,
  Group,
  SharedExpensePayload,
} from "./shared-expense/types";
import { useSharedExpenseForm } from "./shared-expense/use-shared-expense-form";

export type { SharedExpensePayload };

type Props = {
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
    state,
    set,
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
    currentUserId,
  } = useSharedExpenseForm({
    isOpen,
    onClose,
    friends,
    groups,
    onSave,
    onSaveGroupExpense,
    defaultGroupId,
    defaultFriendId,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <m.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-(--card-solid) border border-(--card-border) w-full md:max-w-[520px] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl text-foreground z-10 flex flex-col max-h-[92dvh] md:max-h-[88vh] mx-0 md:mx-4"
          >
            {/* Header */}
            <DialogHeader
              step={state.step}
              shareType={state.shareType}
              selectedGroupName={selectedGroup?.name}
              selectedFriendName={selectedFriend?.user.name}
              onBack={() => set({ step: "form" })}
              onClose={handleClose}
            />

            {/* Progress bar */}
            <div className="flex items-center gap-2 px-6 pt-3 shrink-0">
              <div className="h-1 flex-1 rounded-full bg-blue-500" />
              <div
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  state.step === "split" ? "bg-blue-500" : "bg-(--card-border)",
                )}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ── FORM STEP ──────────────────────────────────────── */}
                {state.step === "form" ? (
                  <SharedExpenseFormStep
                    state={state}
                    set={set}
                    friends={friends}
                    groups={groups}
                    displayCurrency={displayCurrency}
                    convertCurrency={convertCurrency}
                    parsedAmount={parsedAmount}
                    amountNok={amountNok}
                    groupShareNok={groupShareNok}
                    splitSummaryLabel={splitSummaryLabel}
                    myNok={myNok}
                    friendNok={friendNok}
                    canSave={canSave}
                    handleClose={handleClose}
                    handleSave={handleSave}
                  />
                ) : (
                  /* ── SPLIT STEP ─────────────────────────────────────── */
                  <SharedExpenseSplitStep
                    state={state}
                    set={set}
                    selectedFriend={selectedFriend}
                    selectedGroup={selectedGroup}
                    currentUserId={currentUserId}
                    amountNok={amountNok}
                    groupShareNok={groupShareNok}
                    parsedAmount={parsedAmount}
                    displayCurrency={displayCurrency}
                    convertCurrency={convertCurrency}
                    myNok={myNok}
                    friendNok={friendNok}
                    myPct={myPct}
                    friendPct={friendPct}
                    checkedCount={checkedCount}
                    customIsExact={customIsExact}
                    customDifference={customDifference}
                    onToggleGroupSplitMode={handleToggleGroupSplitMode}
                    onToggleMember={handleToggleMember}
                    onChangeCustomSplit={handleChangeCustomSplit}
                    handleSave={handleSave}
                  />
                )}
              </AnimatePresence>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
