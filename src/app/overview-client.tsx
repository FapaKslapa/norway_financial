"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Globe, Settings, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { trpc } from "@/lib/trpc/client";
import { BudgetProgressCard } from "./overview/components/budget-progress-card";
import { CategoryBudgetsCard } from "./overview/components/category-budgets-card";
import { CurrencyConverterCard } from "./overview/components/currency-converter-card";
import { OverviewAnalyticsCard } from "./overview/components/overview-analytics-card";
import { OverviewFriendBalancesCard } from "./overview/components/overview-friend-balances-card";
import { OverviewHeader } from "./overview/components/overview-header";
import { QuickAddForm } from "./overview/components/quick-add-form";
import { RecentTodoCard } from "./overview/components/recent-todo-card";
import { RecentTransactionsCard } from "./overview/components/recent-transactions-card";
import { StatsGrid } from "./overview/components/stats-grid";

export default function OverviewClient() {
  const router = useRouter();
  const { convertCurrency, displayCurrency, rates, settings, user } =
    useDashboard();

  const categoriesQuery = trpc.category.list.useQuery();
  const transactionsQuery = trpc.transaction.list.useQuery();
  const _friendsQuery = trpc.friend.listFriends.useQuery();
  const listsQuery = trpc.todo.listLists.useQuery();
  const categoryBudgetsQuery = trpc.categoryBudget.list.useQuery();

  const activeListId = listsQuery.data?.[0]?.id;
  const todosQuery = trpc.todo.list.useQuery(
    { todoListId: activeListId ?? "" },
    { enabled: !!activeListId },
  );

  const createTransactionMutation = trpc.transaction.create.useMutation({
    onSuccess: () => {
      transactionsQuery.refetch();
      if (activeListId) {
        todosQuery.refetch();
      }
    },
  });

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gravio_onboarding_dismissed") !== "true";
    }
    return true;
  });

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("gravio_onboarding_dismissed", "true");
  };

  const transactions = transactionsQuery.data || [];
  const categoryBudgets = categoryBudgetsQuery.data || [];
  const currentMonthTransactions = transactions.filter((t) =>
    dayjs(t.date).isSame(dayjs(), "month"),
  );

  const totalIncomeEur = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amountEur), 0);

  const totalExpenseEur = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amountEur), 0);

  const totalIncome = convertCurrency(totalIncomeEur, "EUR", displayCurrency);
  const totalExpense = convertCurrency(totalExpenseEur, "EUR", displayCurrency);
  const netSavings = totalIncome - totalExpense;

  const targetBudgetValNok = settings
    ? parseFloat(settings.targetMonthlyBudget)
    : 10000;
  const maxBudgetValNok = settings
    ? parseFloat(settings.maxMonthlyBudget)
    : 12000;

  const targetBudgetVal = convertCurrency(
    targetBudgetValNok,
    "NOK",
    displayCurrency,
  );
  const maxBudgetVal = convertCurrency(maxBudgetValNok, "NOK", displayCurrency);

  const handleSaveQuickAdd = async (tx: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => {
    await createTransactionMutation.mutateAsync({
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      exchangeRate: rates[tx.currency] ?? 1.0,
      exchangeRateNok: rates.NOK ?? 11.85,
      categoryId: tx.categoryId,
      date: tx.date,
      sharedWithUserId: null,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <OverviewHeader
          userName={user.name}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        />
      </motion.div>

      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)",
            }}
          >
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/5 -translate-y-20 translate-x-20 pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-32 h-32 rounded-full bg-white/5 translate-y-12 pointer-events-none" />

            <button
              type="button"
              onClick={handleDismissOnboarding}
              className="absolute top-2 right-2 h-10 w-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 cursor-pointer bg-transparent border-0 transition-all z-30"
              aria-label="Chiudi onboarding"
            >
              <X size={15} />
            </button>

            <div className="relative z-10 p-6 pb-5">
              <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center mb-4 text-white">
                <Globe size={22} />
              </div>

              <h2 className="text-base font-black text-white mb-1 tracking-tight">
                Benvenuto in Gravio
              </h2>
              <p className="text-xs text-white/65 leading-relaxed max-w-md">
                Tieni traccia delle tue spese in qualsiasi valuta con tassi di
                cambio in tempo reale. Inizia configurando la tua valuta e il
                budget mensile.
              </p>

              <div className="flex items-center gap-3 mt-5">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <BarChart3 size={13} className="text-white/70" />
                  <span className="text-[10px] font-bold text-white">
                    Analytics
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <Globe size={13} className="text-white/70" />
                  <span className="text-[10px] font-bold text-white">
                    Multi-valuta
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <ShieldCheck size={13} className="text-white/70" />
                  <span className="text-[10px] font-bold text-white">
                    Budget
                  </span>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/settings?tab=general")}
                className="mt-5 flex items-center gap-2 bg-white text-blue-600 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer border-0 shadow-lg shadow-black/10 transition-all"
              >
                <Settings size={12} />
                Configura ora
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatsGrid
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        displayCurrency={displayCurrency}
      />

      <div className="overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0 md:overflow-visible md:snap-none">
        <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6 w-max md:w-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <BudgetProgressCard
              totalExpense={totalExpense}
              targetBudgetVal={targetBudgetVal}
              maxBudgetVal={maxBudgetVal}
              displayCurrency={displayCurrency}
              onOpenSettings={() => router.push("/settings?tab=budget")}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-2"
          >
            <RecentTransactionsCard
              transactions={transactions}
              categories={categoriesQuery.data || []}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
            />
          </motion.div>
        </div>
      </div>

      <div className="overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0 md:overflow-visible md:snap-none">
        <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6 w-max md:w-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.29, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <CategoryBudgetsCard
              transactions={currentMonthTransactions}
              categories={categoriesQuery.data || []}
              categoryBudgets={categoryBudgets}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
              onOpenSettings={() => router.push("/settings?tab=budget")}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <RecentTodoCard
              todos={todosQuery.data || []}
              displayCurrency={displayCurrency}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.43, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <CurrencyConverterCard />
          </motion.div>
        </div>
      </div>

      <div className="overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0 md:overflow-visible md:snap-none">
        <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6 w-max md:w-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-2"
          >
            <OverviewAnalyticsCard
              transactions={transactions}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <OverviewFriendBalancesCard />
          </motion.div>
        </div>
      </div>

      <QuickAddForm
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categoriesQuery.data || []}
        onSave={handleSaveQuickAdd}
      />
    </div>
  );
}
