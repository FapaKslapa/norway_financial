"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Globe, Settings, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { trpc } from "@/lib/trpc/client";
import { BudgetProgressCard } from "./overview/components/budget-progress-card";
import { CurrencyConverterCard } from "./overview/components/currency-converter-card";
import { OverviewHeader } from "./overview/components/overview-header";
import { QuickAddForm } from "./overview/components/quick-add-form";
import { RecentTodoCard } from "./overview/components/recent-todo-card";
import { RecentTransactionsCard } from "./overview/components/recent-transactions-card";
import { StatsGrid } from "./overview/components/stats-grid";

export default function OverviewClient() {
  const {
    convertCurrency,
    displayCurrency,
    rates,
    settings,
    setIsSettingsOpen,
    setSettingsTab,
    user,
  } = useDashboard();

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
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("globe_finance_onboarding_dismissed") !== "true"
      );
    }
    return true;
  });

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("globe_finance_onboarding_dismissed", "true");
  };

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
            className="relative overflow-hidden rounded-3xl select-none"
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
              className="absolute top-4 right-4 h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 cursor-pointer bg-transparent border-0 transition-all z-10"
            >
              <X size={13} />
            </button>

            <div className="relative z-10 p-6 pb-5">
              <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center mb-4 text-white">
                <Globe size={22} />
              </div>

              <h2 className="text-base font-black text-white mb-1 tracking-tight">
                Benvenuto in GlobeFinance
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
                onClick={() => {
                  setSettingsTab("general");
                  setIsSettingsOpen(true);
                }}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-1 h-full flex flex-col"
        >
          <BudgetProgressCard
            totalExpense={totalExpense}
            targetBudgetVal={targetBudgetVal}
            maxBudgetVal={maxBudgetVal}
            displayCurrency={displayCurrency}
            onOpenSettings={() => {
              setSettingsTab("budget");
              setIsSettingsOpen(true);
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2 h-full flex flex-col"
        >
          <RecentTransactionsCard
            transactions={transactions}
            categories={categoriesQuery.data || []}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.29, ease: [0.16, 1, 0.3, 1] }}
        >
          <CurrencyConverterCard />
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
        onSave={handleSaveQuickAdd}
      />
    </div>
  );
}
