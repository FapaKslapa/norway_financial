"use client";

import { Button, Card } from "@heroui/react";
import {
  Activity,
  Calendar,
  ChevronLeft,
  DollarSign,
  Handshake,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { cn, formatCurrency } from "@/lib/utils";

const nokFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

type FriendUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type FriendItem = {
  friendshipId: string;
  user: FriendUser;
  createdAt: Date | null;
};

type BalanceInfo = {
  user: { id: string; name: string; email: string };
  balanceNok: number;
};

type TransactionInfo = {
  id: string;
  userId: string;
  payerName?: string | null;
  amountEur: string;
  amountNok: string;
  description: string | null;
  date: Date;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
  } | null;
};

type FriendDetailCardProps = {
  selectedFriend: FriendItem;
  onClear: () => void;
  onOpenSharedExpense: () => void;
  onOpenSettleDebt: (friend: FriendItem) => void;
  onOpenDeleteFriend: (friend: FriendItem) => void;
  balances: BalanceInfo[];
  transactions: TransactionInfo[];
  currentUserId: string;
  displayCurrency: string;
  convertNokAmount: (val: number | string) => number;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function FriendDetailCard({
  selectedFriend,
  onClear,
  onOpenSharedExpense,
  onOpenSettleDebt,
  onOpenDeleteFriend,
  balances,
  transactions,
  currentUserId,
  displayCurrency,
  convertNokAmount,
  convertCurrency,
}: FriendDetailCardProps) {
  const balObj = balances.find((b) => b.user.id === selectedFriend.user.id);
  const balVal = balObj ? balObj.balanceNok : 0;
  const hasBal = Math.abs(balVal) >= 0.01;

  const title =
    balVal > 0 ? "Ti deve" : balVal < 0 ? "Gli devi" : "Bilancio con l'amico";
  const value = hasBal
    ? `${balVal > 0 ? "+" : "-"}${formatCurrency(convertNokAmount(Math.abs(balVal)), displayCurrency)}`
    : "In pari";
  const subtitle = hasBal
    ? `${nokFormatter.format(Math.abs(balVal))} NOK`
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
        : "text-(--text-muted)";
  const valColor =
    balVal > 0
      ? "text-emerald-500"
      : balVal < 0
        ? "text-rose-500"
        : "text-(--text-muted)";

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-6 rounded-[2rem] flex flex-col">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-(--card-border) mb-5 gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <Button
            isIconOnly
            variant="ghost"
            className="h-8 w-8 text-(--text-muted) hover:bg-neutral-500/10 rounded-xl cursor-pointer border-0 shrink-0 flex items-center justify-center"
            onPress={onClear}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 text-base font-extrabold">
            {selectedFriend.user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-foreground truncate leading-tight">
              {selectedFriend.user.name}
            </span>
            <span className="text-[10px] text-(--text-muted) truncate mt-0.5">
              {selectedFriend.user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Button
            variant="outline"
            className="font-bold text-[10px] h-8 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border-0 rounded-xl px-2.5 sm:px-3 flex items-center gap-1 cursor-pointer transition-all shrink-0"
            onPress={onOpenSharedExpense}
          >
            <Plus size={11} />
            <span className="hidden sm:inline">Aggiungi Spesa</span>
            <span className="sm:hidden">Aggiungi</span>
          </Button>

          {hasBal && balVal < 0 && (
            <Button
              variant="outline"
              className="font-bold text-[10px] h-8 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-0 rounded-xl px-2.5 sm:px-3 flex items-center gap-1 cursor-pointer transition-all shrink-0"
              onPress={() => onOpenSettleDebt(selectedFriend)}
            >
              <DollarSign size={11} />
              <span>Salda</span>
            </Button>
          )}

          <Button
            isIconOnly
            variant="ghost"
            className="h-8 w-8 text-(--text-muted) hover:text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer border-0 shrink-0 flex items-center justify-center"
            onPress={() => onOpenDeleteFriend(selectedFriend)}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 gap-4 mb-6">
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

        <StatCard
          title="Spese Condivise"
          value={transactions.length}
          subtitle="Transazioni in comune"
          icon={<Activity size={20} />}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-500"
          delayIndex={1}
        />
      </div>

      {}
      <div className="flex flex-col flex-1">
        <h4 className="text-[10px] text-(--text-muted) font-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity size={12} className="opacity-60" />
          Cronologia Spese in Comune
        </h4>

        <div className="flex-1 overflow-y-auto max-h-[250px] pr-1 flex flex-col gap-2.5">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-(--text-muted) font-semibold">
              Nessuna spesa condivisa registrata con questo amico.
            </div>
          ) : (
            transactions.map((tx) => {
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
                  className="flex justify-between items-center p-3 rounded-2xl bg-neutral-500/5 border border-(--card-border) shrink-0"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate leading-tight">
                      {tx.description || "Spesa condivisa"}
                    </span>
                    <span className="text-[8px] text-(--text-muted) font-semibold flex items-center gap-2 mt-1">
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
                          ? "text-(--text-muted) line-through"
                          : isPayer
                            ? "text-emerald-500"
                            : "text-rose-500",
                      )}
                    >
                      {isPayer ? "+" : "-"}{" "}
                      {formatCurrency(activeAmount, displayCurrency)}
                    </span>
                    <span className="text-[8px] text-(--text-muted) font-semibold mt-0.5">
                      Totale: {formatCurrency(originalAmount, displayCurrency)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
