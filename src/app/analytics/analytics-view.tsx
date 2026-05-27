"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { trpc } from "@/lib/trpc/client";
import { AnalyticsHeader } from "./components/analytics-header";
import { AnalyticsSummaryCards } from "./components/analytics-summary-cards";
import { CategoryBreakdown } from "./components/category-breakdown";
import { ExpenseTrendCard } from "./components/expense-trend-card";
import { IncomeTrendCard } from "./components/income-trend-card";
import { RecentLogs } from "./components/recent-logs";
import { SavingsTrendCard } from "./components/savings-trend-card";
import { SpendingCalendarCard } from "./components/spending-calendar-card";

const MONTH_SHORT = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

export default function AnalyticsView() {
  const { displayCurrency, convertCurrency } = useDashboard();

  const categoriesQuery = trpc.category.list.useQuery();
  const transactionsQuery = trpc.transaction.list.useQuery();

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setSelectedDay(null);
  }, []);

  if (categoriesQuery.isLoading || transactionsQuery.isLoading) {
    return <LoadingState />;
  }

  const rawTxs = transactionsQuery.data || [];
  const transactions = rawTxs.map((t) => ({
    ...t,
    type: t.type as "expense" | "income",
    currency: t.currency,
  }));
  const categories = categoriesQuery.data || [];

  const convertNokAmount = (nokVal: string) =>
    convertCurrency(parseFloat(nokVal) || 0, "NOK", displayCurrency);

  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dailyExpensesMap: Record<number, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyExpensesMap[d] = 0;
  }
  for (const t of monthTransactions) {
    if (t.type === "expense") {
      const day = new Date(t.date).getDate();
      dailyExpensesMap[day] =
        (dailyExpensesMap[day] || 0) + convertNokAmount(t.amountNok);
    }
  }

  const maxDailyExpense = Math.max(...Object.values(dailyExpensesMap), 1);

  const categoryExpensesMap: Record<
    string,
    { amount: number; color: string; name: string; icon: string }
  > = {};

  for (const t of monthTransactions) {
    if (t.type === "expense") {
      const catId = t.categoryId || "uncategorized";
      const amount = convertNokAmount(t.amountNok);

      if (!categoryExpensesMap[catId]) {
        const dbCat = categories.find((c) => c.id === catId);
        categoryExpensesMap[catId] = {
          amount: 0,
          color: dbCat?.color || "#8e8e93",
          name: dbCat?.name || "Altro/Senza Categoria",
          icon: dbCat?.icon || "HelpCircle",
        };
      }
      categoryExpensesMap[catId].amount += amount;
    }
  }

  const categoryExpenses = Object.entries(categoryExpensesMap)
    .map(([id, info]) => ({
      id,
      ...info,
      percentage: totalExpense > 0 ? (info.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const last6MonthsData = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) {
      m += 12;
      y -= 1;
    }

    const mTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const inc = mTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

    const exp = mTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

    last6MonthsData.push({
      label: `${MONTH_SHORT[m]} ${y.toString().slice(-2)}`,
      income: inc,
      expense: exp,
      savings: inc - exp,
    });
  }

  const timelineTransactions = selectedDay
    ? monthTransactions.filter(
        (t) => new Date(t.date).getDate() === selectedDay,
      )
    : monthTransactions;

  const sortedTimeline = [...timelineTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectMonth = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-3 pb-24 md:pb-12 text-[var(--foreground)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnalyticsHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectMonth={handleSelectMonth}
        />
      </motion.div>

      <AnalyticsSummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        savingsRate={savingsRate}
        displayCurrency={displayCurrency}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <SavingsTrendCard
            trendData={last6MonthsData}
            displayCurrency={displayCurrency}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <CategoryBreakdown
            categoryExpenses={categoryExpenses}
            totalExpense={totalExpense}
            displayCurrency={displayCurrency}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.29, ease: [0.16, 1, 0.3, 1] }}
        >
          <ExpenseTrendCard
            trendData={last6MonthsData}
            displayCurrency={displayCurrency}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
        >
          <IncomeTrendCard
            trendData={last6MonthsData}
            displayCurrency={displayCurrency}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.43, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <SpendingCalendarCard
            currentMonth={currentMonth}
            currentYear={currentYear}
            dailyExpensesMap={dailyExpensesMap}
            maxDailyExpense={maxDailyExpense}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            displayCurrency={displayCurrency}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <RecentLogs
            sortedTimeline={sortedTimeline}
            categories={categories}
            displayCurrency={displayCurrency}
            convertCurrency={convertCurrency}
          />
        </motion.div>
      </div>
    </div>
  );
}
