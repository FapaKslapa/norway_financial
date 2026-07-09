"use client";

import { Button } from "@heroui/react";
import { Users } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type GroupMember = {
  id: string;
  name: string;
  email: string;
};

type GroupMemberListProps = {
  members: GroupMember[];
  currentUserId: string;
};

export function GroupMemberList({
  members,
  currentUserId,
}: GroupMemberListProps) {
  return (
    <div className="mb-5">
      <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <Users size={12} className="opacity-60" />
        Membri del Gruppo
      </h4>
      <div className="flex flex-wrap gap-2">
        {members.map((m: GroupMember) => (
          <div
            key={m.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-500/5 border border-(--card-border) text-xs font-semibold"
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
  );
}

type GroupSettlementProposal = {
  fromUser: { id: string; name: string; email: string; image: string | null };
  toUser: { id: string; name: string; email: string; image: string | null };
  amountNok: number;
};

type GroupSettlementProposalsProps = {
  proposals: GroupSettlementProposal[];
  isProposalsLoading: boolean;
  currentUserId: string;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  isSettlingId: string | null;
  onSettle: (friendId: string) => void;
};

export function GroupSettlementProposals({
  proposals,
  isProposalsLoading,
  currentUserId,
  displayCurrency,
  convertCurrency,
  isSettlingId,
  onSettle,
}: GroupSettlementProposalsProps) {
  return (
    <div className="mb-5 border-t border-(--card-border)/50 pt-4">
      <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        <span className="text-blue-500">✦</span>
        Debiti Semplificati (Algoritmo Splitwise)
      </h4>
      {isProposalsLoading ? (
        <div className="text-[10px] text-(--text-muted)">
          Calcolo liquidazioni ottimali...
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div className="flex flex-col gap-2">
          {proposals.map((p: GroupSettlementProposal) => {
            const isFromMe = p.fromUser.id === currentUserId;
            const isToMe = p.toUser.id === currentUserId;
            const canSettle = isFromMe || isToMe;
            const targetFriendId = isFromMe ? p.toUser.id : p.fromUser.id;

            return (
              <div
                key={`${p.fromUser.id}-${p.toUser.id}-${p.amountNok}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-100/5 dark:bg-zinc-800/10 border border-(--card-border)/40 rounded-2xl p-3"
              >
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span
                    className={cn(
                      "font-bold",
                      isFromMe ? "text-rose-500" : "text-foreground",
                    )}
                  >
                    {p.fromUser.name} {isFromMe && "(Tu)"}
                  </span>
                  <span className="text-[10px] text-(--text-muted)">
                    deve dare a
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      isToMe ? "text-emerald-500" : "text-foreground",
                    )}
                  >
                    {p.toUser.name} {isToMe && "(Tu)"}
                  </span>
                  <span className="text-xs font-black text-blue-500 ml-1">
                    {formatCurrency(
                      convertCurrency(p.amountNok, "NOK", displayCurrency),
                      displayCurrency,
                    )}
                  </span>
                </div>
                {canSettle && (
                  <Button
                    variant="outline"
                    className="h-7 text-[9px] font-bold bg-neutral-500/10 hover:bg-blue-500 hover:text-white rounded-lg px-3 shrink-0 cursor-pointer border-0 transition-all self-end sm:self-auto"
                    onPress={() => onSettle(targetFriendId)}
                    isDisabled={isSettlingId !== null}
                  >
                    {isSettlingId === targetFriendId
                      ? "Salvataggio..."
                      : "Salda"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[10px] text-(--text-muted) italic pl-1">
          Tutti i debiti in questo gruppo sono saldati!
        </p>
      )}
    </div>
  );
}
