"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useState } from "react";
import { useDashboard } from "../components/dashboard-layout";
import { LoadingState } from "../components/ui/loading-state";
import { trpc } from "../lib/trpc/client";
import { BudgetProgressCard } from "./overview/components/budget-progress-card";
import { CurrencyConverterCard } from "./overview/components/currency-converter-card";
import { OverviewHeader } from "./overview/components/overview-header";
import { QuickAddForm } from "./overview/components/quick-add-form";
import { RecentTodoCard } from "./overview/components/recent-todo-card";
import { RecentTransactionsCard } from "./overview/components/recent-transactions-card";
import { StatsGrid } from "./overview/components/stats-grid";

export default function OverviewClient() {
  const { displayCurrency, exchangeRate, settings, setIsSettingsOpen, user } =
    useDashboard();

  const categoriesQuery = trpc.category.list.useQuery();
  const transactionsQuery = trpc.transaction.list.useQuery();
  const friendsQuery = trpc.friend.listFriends.useQuery();
  const listsQuery = trpc.todo.listLists.useQuery();

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

  if (
    categoriesQuery.isLoading ||
    transactionsQuery.isLoading ||
    friendsQuery.isLoading ||
    listsQuery.isLoading
  ) {
    return <LoadingState />;
  }

  const transactions = transactionsQuery.data || [];
  const currentMonthTransactions = transactions.filter((t) =>
    dayjs(t.date).isSame(dayjs(), "month"),
  );

  const totalIncomeNok = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amountNok), 0);

  const totalExpenseNok = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amountNok), 0);

  const totalIncome =
    displayCurrency === "NOK" ? totalIncomeNok : totalIncomeNok / exchangeRate;
  const totalExpense =
    displayCurrency === "NOK"
      ? totalExpenseNok
      : totalExpenseNok / exchangeRate;
  const netSavings = totalIncome - totalExpense;

  const targetBudgetVal = settings
    ? parseFloat(settings.targetMonthlyBudget)
    : 10000;
  const maxBudgetVal = settings ? parseFloat(settings.maxMonthlyBudget) : 12000;

  const handleSaveQuickAdd = async (tx: {
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: "EUR" | "NOK";
    categoryId: string | null;
    date: string;
    sharedWithUserId: string | null;
  }) => {
    await createTransactionMutation.mutateAsync({
      description: tx.description,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      exchangeRate,
      categoryId: tx.categoryId,
      date: tx.date,
      sharedWithUserId: tx.sharedWithUserId,
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

      <StatsGrid
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        displayCurrency={displayCurrency}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-1"
        >
          <BudgetProgressCard
            totalExpense={
              displayCurrency === "NOK"
                ? totalExpenseNok
                : totalExpenseNok / exchangeRate
            }
            targetBudgetVal={
              displayCurrency === "NOK"
                ? targetBudgetVal
                : targetBudgetVal / exchangeRate
            }
            maxBudgetVal={
              displayCurrency === "NOK"
                ? maxBudgetVal
                : maxBudgetVal / exchangeRate
            }
            displayCurrency={displayCurrency}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2"
        >
          <RecentTransactionsCard
            transactions={transactions}
            categories={categoriesQuery.data || []}
            displayCurrency={displayCurrency}
            exchangeRate={exchangeRate}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.29, ease: [0.16, 1, 0.3, 1] }}
        >
          <CurrencyConverterCard exchangeRate={exchangeRate} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2"
        >
          <RecentTodoCard
            todos={todosQuery.data || []}
            displayCurrency={displayCurrency}
          />
        </motion.div>
      </div>

      <QuickAddForm
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categoriesQuery.data || []}
        friends={friendsQuery.data || []}
        exchangeRate={exchangeRate}
        onSave={handleSaveQuickAdd}
      />
    </div>
  );
}
