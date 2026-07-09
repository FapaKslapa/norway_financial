"use client";

import { Check, Users } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Group } from "./types";

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-1.5">
      <Icon size={11} className="opacity-60" />
      {children}
    </span>
  );
}

type Props = {
  selectedGroup: Group | undefined;
  checkedMemberIds: string[];
  groupSplitMode: "equal" | "custom";
  customSplitsVal: Record<string, string>;
  currentUserId: string;
  currency: string;
  amountNok: number;
  groupShareNok: number;
  parsedAmount: number;
  displayCurrency: string;
  customIsExact: boolean;
  customDifference: number;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onToggleGroupSplitMode: (mode: "equal" | "custom") => void;
  onToggleMember: (id: string) => void;
  onChangeCustomSplit: (memberId: string, val: string) => void;
};

export function GroupMemberSplits({
  selectedGroup,
  checkedMemberIds,
  groupSplitMode,
  customSplitsVal,
  currentUserId,
  currency,
  amountNok,
  groupShareNok,
  parsedAmount,
  displayCurrency,
  customIsExact,
  customDifference,
  convertCurrency,
  onToggleGroupSplitMode,
  onToggleMember,
  onChangeCustomSplit,
}: Props) {
  const checkedCount = checkedMemberIds.length;
  const checkedMemberIdsSet = useMemo(
    () => new Set(checkedMemberIds),
    [checkedMemberIds],
  );

  return (
    <>
      {/* Participants section */}
      <div>
        <FieldLabel icon={Users}>Partecipanti nel Gruppo</FieldLabel>
        <p className="text-[10px] text-(--text-muted) -mt-1.5 mb-2.5">
          Seleziona chi partecipa a questa spesa.
        </p>

        {/* Equal / Custom toggle */}
        <div className="flex p-1 bg-neutral-500/5 rounded-xl border border-(--card-border) mb-3 select-none">
          <button
            type="button"
            onClick={() => onToggleGroupSplitMode("equal")}
            className={cn(
              "flex-1 text-[10px] py-1.5 font-bold rounded-lg transition-all border-0 cursor-pointer",
              groupSplitMode === "equal"
                ? "bg-foreground text-background shadow-sm"
                : "text-(--text-muted) bg-transparent hover:bg-neutral-500/10",
            )}
          >
            Uguale
          </button>
          <button
            type="button"
            onClick={() => onToggleGroupSplitMode("custom")}
            className={cn(
              "flex-1 text-[10px] py-1.5 font-bold rounded-lg transition-all border-0 cursor-pointer",
              groupSplitMode === "custom"
                ? "bg-foreground text-background shadow-sm"
                : "text-(--text-muted) bg-transparent hover:bg-neutral-500/10",
            )}
          >
            Personalizzato
          </button>
        </div>

        {/* Member rows */}
        <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1">
          {selectedGroup?.members.map((member) => {
            const checked = checkedMemberIdsSet.has(member.id);
            const isMe = member.id === currentUserId;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onToggleMember(member.id)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left bg-transparent",
                  checked
                    ? "border-blue-500/30 bg-blue-500/5"
                    : "border-(--card-border) hover:bg-neutral-500/5",
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "h-5 w-5 rounded-md flex items-center justify-center border transition-all",
                      checked
                        ? "bg-blue-500 border-transparent text-white"
                        : "border-(--card-border) text-transparent",
                    )}
                  >
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">
                      {member.name} {isMe && "(Tu)"}
                    </span>
                  </div>
                </div>
                {checked && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 cursor-default"
                  >
                    {groupSplitMode === "custom" ? (
                      <div className="flex items-center gap-1 bg-neutral-500/5 px-2 py-1 rounded-lg border border-(--card-border)">
                        <input
                          type="number"
                          aria-label="Importo quota personalizzata"
                          min="0"
                          step="0.01"
                          value={customSplitsVal[member.id] || ""}
                          onChange={(e) =>
                            onChangeCustomSplit(member.id, e.target.value)
                          }
                          className="w-16 text-right text-[11px] font-black bg-transparent border-0 outline-none text-foreground p-0"
                          placeholder="0.00"
                        />
                        <span className="text-[9px] text-(--text-muted) font-black">
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
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {amountNok > 0 && checkedCount > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-neutral-500/5 border border-(--card-border) rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider">
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
            {(selectedGroup?.members || []).flatMap((m) => {
              if (!checkedMemberIdsSet.has(m.id)) return [];
              const displayVal =
                groupSplitMode === "custom"
                  ? parseFloat(customSplitsVal[m.id]) || 0
                  : convertCurrency(groupShareNok, "NOK", currency);
              return [
                <div
                  key={m.id}
                  className="flex justify-between items-center text-[11px]"
                >
                  <span className="text-(--text-muted)">
                    {m.id === currentUserId ? "Tua quota (Tu paghi)" : m.name}
                  </span>
                  <span className="text-blue-500">
                    {formatCurrency(displayVal, currency)}
                  </span>
                </div>,
              ];
            })}
          </div>
        </div>
      )}
    </>
  );
}
