"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { DollarSign, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmountWithTooltip } from "./amount-with-tooltip";

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

type BalanceEntry = {
  user: { id: string; name: string; email: string };
  balanceNok: number;
};

interface FriendListPanelProps {
  friends: FriendItem[];
  balances: BalanceEntry[];
  displayCurrency: string;
  convertNokAmount: (val: number) => number;
  onSelectFriend: (friend: FriendItem) => void;
  onSettleFriend: (friend: FriendItem) => void;
  onDeleteFriend: (friend: FriendItem) => void;
}

export function FriendListPanel({
  friends,
  balances,
  displayCurrency,
  convertNokAmount,
  onSelectFriend,
  onSettleFriend,
  onDeleteFriend,
}: FriendListPanelProps) {
  return (
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
        {!friends || friends.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-xs text-(--text-muted) gap-2 py-16">
            <Users size={32} className="opacity-20" />
            <span className="font-bold">Non hai ancora nessun amico.</span>
            <span className="text-[10px] text-center max-w-[200px] font-semibold leading-normal">
              Aggiungine uno digitando la sua email nella sezione a sinistra!
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 max-h-[440px]">
            {friends.map((friend) => {
              const balanceObj = balances.find(
                (b) => b.user.id === friend.user.id,
              );
              const balValue = balanceObj ? balanceObj.balanceNok : 0;
              const isOwed = balValue > 0;
              const hasBalance = Math.abs(balValue) >= 0.01;

              return (
                <div
                  key={friend.user.id}
                  className="relative flex justify-between items-center p-4 rounded-2xl bg-neutral-500/5 border border-(--card-border) hover:bg-neutral-500/10 transition-colors shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => onSelectFriend(friend)}
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
                            amount={convertNokAmount(Math.abs(balValue))}
                            currency={displayCurrency}
                            prefix={isOwed ? "Ti deve " : "Gli devi "}
                            className={cn(
                              "text-xs font-black tracking-tight pointer-events-auto",
                              isOwed ? "text-emerald-500" : "text-rose-500",
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
                        onPress={() => onSettleFriend(friend)}
                      >
                        <DollarSign size={11} /> Salda
                      </Button>
                    )}

                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      className="text-(--text-muted) hover:text-rose-500 hover:bg-rose-500/10 rounded-xl h-8 w-8 min-w-8 cursor-pointer flex items-center justify-center border-0 ml-1"
                      onPress={() => onDeleteFriend(friend)}
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
  );
}
