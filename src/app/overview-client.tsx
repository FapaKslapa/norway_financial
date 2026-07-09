"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { useTRPC } from "@/lib/trpc/client";
import { BudgetProgressCard } from "./overview/components/budget-progress-card";
import { CategoryBudgetsCard } from "./overview/components/category-budgets-card";
import { CurrencyConverterCard } from "./overview/components/currency-converter-card";
import { OnboardingCard } from "./overview/components/onboarding-card";
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

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery(trpc.category.list.queryOptions());
  const { data: transactionsData } = useQuery(
    trpc.transaction.list.queryOptions(),
  );
  const { data: _friendsData } = useQuery(
    trpc.friend.listFriends.queryOptions(),
  );
  const { data: listsData } = useQuery(trpc.todo.listLists.queryOptions());
  const { data: categoryBudgetsData } = useQuery(
    trpc.categoryBudget.list.queryOptions(),
  );

  const activeListId = listsData?.[0]?.id;
  const { data: todosData } = useQuery(
    trpc.todo.list.queryOptions(
      { todoListId: activeListId ?? "" },
      { enabled: !!activeListId },
    ),
  );

  const createTransactionMutation = useMutation(
    trpc.transaction.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.list.queryKey(),
        });
        if (activeListId) {
          queryClient.invalidateQueries({
            queryKey: trpc.todo.list.queryKey({ todoListId: activeListId }),
          });
        }
      },
    }),
  );

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

  const transactions = transactionsData || [];
  const categoryBudgets = categoryBudgetsData || [];
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
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <OverviewHeader
          userName={user.name}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        />
      </m.div>

      <OnboardingCard
        showOnboarding={showOnboarding}
        onDismiss={handleDismissOnboarding}
      />

      <StatsGrid
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        displayCurrency={displayCurrency}
      />

      <div className="overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0 md:overflow-visible md:snap-none">
        <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6 w-max md:w-auto">
          <m.div
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
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-2"
          >
            <RecentTransactionsCard
              transactions={transactions}
              categories={categoriesData || []}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
            />
          </m.div>
        </div>
      </div>

      <div className="overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0 md:overflow-visible md:snap-none">
        <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6 w-max md:w-auto">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.29, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <CategoryBudgetsCard
              transactions={currentMonthTransactions}
              categories={categoriesData || []}
              categoryBudgets={categoryBudgets}
              displayCurrency={displayCurrency}
              convertCurrency={convertCurrency}
              onOpenSettings={() => router.push("/settings?tab=budget")}
            />
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <RecentTodoCard
              todos={todosData || []}
              displayCurrency={displayCurrency}
            />
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.43, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <CurrencyConverterCard />
          </m.div>
        </div>
      </div>

      <div className="overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0 md:overflow-visible md:snap-none">
        <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6 w-max md:w-auto">
          <m.div
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
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-[85vw] snap-start shrink-0 h-[340px] flex flex-col md:w-auto md:shrink md:h-full md:col-span-1"
          >
            <OverviewFriendBalancesCard />
          </m.div>
        </div>
      </div>

      <QuickAddForm
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categoriesData || []}
        onSave={handleSaveQuickAdd}
      />
    </div>
  );
}
