"use client";

import { m } from "framer-motion";
import { GroupMemberSplits } from "./group-member-splits";
import { SplitModeSelector } from "./split-mode-selector";
import type { FormState, Friend, Group } from "./types";

type SharedExpenseSplitStepProps = {
  state: FormState;
  set: (payload: Partial<FormState>) => void;
  selectedFriend?: Friend;
  selectedGroup?: Group;
  currentUserId: string;
  amountNok: number;
  groupShareNok: number;
  parsedAmount: number;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  myNok: number;
  friendNok: number;
  myPct: number;
  friendPct: number;
  checkedCount: number;
  customIsExact: boolean;
  customDifference: number;
  onToggleGroupSplitMode: (mode: "equal" | "custom") => void;
  onToggleMember: (mId: string) => void;
  onChangeCustomSplit: (memberId: string, val: string) => void;
  handleSave: () => Promise<void>;
};

export function SharedExpenseSplitStep({
  state,
  set,
  selectedFriend,
  selectedGroup,
  currentUserId,
  amountNok,
  groupShareNok,
  parsedAmount,
  displayCurrency,
  convertCurrency,
  myNok,
  friendNok,
  myPct,
  friendPct,
  checkedCount,
  customIsExact,
  customDifference,
  onToggleGroupSplitMode,
  onToggleMember,
  onChangeCustomSplit,
  handleSave,
}: SharedExpenseSplitStepProps) {
  return (
    <m.div
      key="split-step"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      className="px-6 pt-5 pb-6 flex flex-col gap-5"
    >
      {state.shareType === "friend" ? (
        <SplitModeSelector
          splitMode={state.splitMode}
          percentage={state.percentage}
          exactNok={state.exactNok}
          n={state.n}
          friendName={selectedFriend?.user.name}
          myNok={myNok}
          friendNok={friendNok}
          myPct={myPct}
          friendPct={friendPct}
          amountNok={amountNok}
          displayCurrency={displayCurrency}
          convertCurrency={convertCurrency}
          onChangeSplitMode={(v) => set({ splitMode: v })}
          onChangePercentage={(v) => set({ percentage: v })}
          onChangeExactNok={(v) => set({ exactNok: v })}
          onChangeN={(v) => set({ n: v })}
        />
      ) : (
        <GroupMemberSplits
          selectedGroup={selectedGroup}
          checkedMemberIds={state.checkedMemberIds}
          groupSplitMode={state.groupSplitMode}
          customSplitsVal={state.customSplitsVal}
          currentUserId={currentUserId}
          currency={state.currency}
          amountNok={amountNok}
          groupShareNok={groupShareNok}
          parsedAmount={parsedAmount}
          displayCurrency={displayCurrency}
          customIsExact={customIsExact}
          customDifference={customDifference}
          convertCurrency={convertCurrency}
          onToggleGroupSplitMode={onToggleGroupSplitMode}
          onToggleMember={onToggleMember}
          onChangeCustomSplit={onChangeCustomSplit}
        />
      )}

      {/* Split step actions */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => set({ step: "form" })}
          className="flex-1 h-11 text-xs font-bold text-foreground border border-(--card-border) hover:bg-neutral-500/10 rounded-xl cursor-pointer bg-transparent transition-all"
        >
          Indietro
        </button>
        <button
          type="button"
          disabled={state.shareType === "group" && checkedCount === 0}
          onClick={handleSave}
          className="flex-[2] h-11 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl cursor-pointer shadow-sm border-0 disabled:opacity-50"
        >
          Aggiungi Spesa
        </button>
      </div>
    </m.div>
  );
}
