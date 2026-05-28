"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { ArrowDownLeft, ArrowUpRight, Check, Users } from "lucide-react";
import { useDashboard } from "@/components/dashboard-layout";
import { trpc } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";

export function OverviewFriendBalancesCard() {
  const { displayCurrency, convertCurrency } = useDashboard();
  const query = trpc.friend.getBalanceSummary.useQuery();

  if (query.isLoading) {
    return (
      <Card className="border border-[var(--card-border)] bg-[var(--card-solid)] shadow-xl p-6 rounded-[2rem] h-full flex flex-col justify-center items-center">
        <span className="text-xs text-[var(--text-muted)] font-bold">
          Caricamento bilancio...
        </span>
      </Card>
    );
  }

  const items = query.data || [];
  const convertedItems = items.map((item) => {
    const val = convertCurrency(item.balanceNok, "NOK", displayCurrency);
    return {
      ...item,
      balance: val,
    };
  });

  const totalCredit = convertedItems
    .filter((i) => i.balance > 0)
    .reduce((sum, i) => sum + i.balance, 0);

  const totalDebit = Math.abs(
    convertedItems
      .filter((i) => i.balance < 0)
      .reduce((sum, i) => sum + i.balance, 0),
  );

  const netBalance = totalCredit - totalDebit;

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card-solid)] shadow-xl p-6 rounded-[2rem] select-none w-full h-full flex flex-col justify-between">
      <CardHeader className="p-0 pb-4 border-b border-[var(--card-border)] mb-4 flex flex-col items-start gap-1">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <Users size={14} className="text-blue-500" />
          Bilancio Amici
        </h4>
        <p className="text-[10px] text-[var(--text-muted)]">
          Riepilogo dei debiti e crediti con i tuoi contatti
        </p>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-2 gap-3.5 bg-neutral-500/5 dark:bg-zinc-800/10 border border-[var(--card-border)]/40 p-3 rounded-2xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider flex items-center gap-0.5">
              <ArrowDownLeft size={10} className="text-emerald-500" /> Ti Devono
            </span>
            <span className="text-xs font-black text-emerald-500">
              {formatCurrency(totalCredit, displayCurrency)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-wider flex items-center gap-0.5">
              Devi Dare <ArrowUpRight size={10} className="text-rose-500" />
            </span>
            <span className="text-xs font-black text-rose-500">
              {formatCurrency(totalDebit, displayCurrency)}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[140px] scrollbar-none">
          {convertedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-[var(--text-muted)] h-full">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-1.5">
                <Check size={14} />
              </div>
              <span className="text-[10px] font-bold">Tutto in pari!</span>
              <p className="text-[8px] opacity-70 mt-0.5">
                Non hai debiti o crediti in sospeso con i tuoi amici.
              </p>
            </div>
          ) : (
            convertedItems.map((item) => {
              const isCredit = item.balance > 0;
              const initials = item.user.name ? item.user.name[0] : "?";
              return (
                <div
                  key={item.user.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-500/5 border border-[var(--card-border)]/30 hover:bg-neutral-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-[var(--foreground)] truncate">
                        {item.user.name || "Amico"}
                      </span>
                      <span className="text-[8px] text-[var(--text-muted)] truncate">
                        {item.user.email}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-black shrink-0 ml-2",
                      isCredit ? "text-emerald-500" : "text-rose-500",
                    )}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(Math.abs(item.balance), displayCurrency)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <div className="border-t border-[var(--card-border)] pt-3.5 mt-3 flex justify-between items-center text-[10px]">
        <span className="text-[9px] text-[var(--text-muted)] font-extrabold uppercase">
          Stato Netto
        </span>
        <span
          className={cn(
            "font-black",
            netBalance > 0
              ? "text-emerald-500"
              : netBalance < 0
                ? "text-rose-500"
                : "text-[var(--text-muted)]",
          )}
        >
          {netBalance > 0 ? "+" : ""}
          {formatCurrency(netBalance, displayCurrency)}
        </span>
      </div>
    </Card>
  );
}
