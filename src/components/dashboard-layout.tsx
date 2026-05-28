"use client";

import {
  BarChart3,
  CheckSquare,
  CreditCard,
  Home,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notifications/notification-bell";
import { useTheme } from "./theme-provider";

export type UserSettingsType = {
  targetMonthlyBudget: string;
  maxMonthlyBudget: string;
  preferredCurrency: string;
  themeMode: string;
  themeAccent: string;
  notifyBudget80?: boolean;
  notifyRecurrentApplied?: boolean;
  notifyFriendActions?: boolean;
};

type DashboardContextType = {
  displayCurrency: string;
  setDisplayCurrency: (val: string | ((prev: string) => string)) => void;
  exchangeRate: number;
  rates: Record<string, number>;
  convertCurrency: (amount: number, from: string, to: string) => number;
  isRateFetched: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  settings: UserSettingsType | null;
  refetchSettings: () => void;
  theme: "light" | "dark";
  changeTheme: (theme: "light" | "dark") => void;
  accent: string;
  changeAccent: (accent: string) => void;
  saveSettings: (updates: {
    targetMonthlyBudget: number;
    maxMonthlyBudget: number;
    preferredCurrency: string;
    themeMode: "light" | "dark";
    themeAccent: string;
    notifyBudget80?: boolean;
    notifyRecurrentApplied?: boolean;
    notifyFriendActions?: boolean;
  }) => Promise<void>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

type DashboardProviderProps = {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

export function DashboardProvider({ children, user }: DashboardProviderProps) {
  const [displayCurrency, setDisplayCurrencyRaw] = useState<string>("EUR");
  const [exchangeRate, setExchangeRate] = useState<number>(11.85);
  const [rates, setRates] = useState<Record<string, number>>({ EUR: 1, NOK: 11.85 });
  const [isRateFetched, setIsRateFetched] = useState(false);
  const { theme, setTheme, accent, setAccent } = useTheme();

  const settingsQuery = trpc.settings.get.useQuery();
  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => { settingsQuery.refetch(); },
  });

  const [hasProcessed, setHasProcessed] = useState(false);
  const processDueRecurrentMutation = trpc.recurrentTransaction.processDue.useMutation();

  useEffect(() => {
    if (isRateFetched && !hasProcessed) {
      setHasProcessed(true);
      processDueRecurrentMutation.mutate({ rates });
    }
  }, [isRateFetched, rates, hasProcessed, processDueRecurrentMutation]);

  useEffect(() => {
    const localVal = localStorage.getItem("preferred_currency");
    if (localVal && localVal.length === 3) {
      setDisplayCurrencyRaw(localVal);
    }
  }, []);

  useEffect(() => {
    if (settingsQuery.data) {
      const dbCurrency = settingsQuery.data.preferredCurrency;
      setDisplayCurrencyRaw(dbCurrency);
      localStorage.setItem("preferred_currency", dbCurrency);
      if (settingsQuery.data.themeMode) {
        setTheme(settingsQuery.data.themeMode as "light" | "dark");
      }
      if (settingsQuery.data.themeAccent) {
        setAccent(settingsQuery.data.themeAccent);
      }
    }
  }, [settingsQuery.data, setTheme, setAccent]);

  const setDisplayCurrency = async (val: string | ((prev: string) => string)) => {
    const nextVal = typeof val === "function" ? val(displayCurrency) : val;
    setDisplayCurrencyRaw(nextVal);
    localStorage.setItem("preferred_currency", nextVal);
    if (settingsQuery.data) {
      try {
        await updateSettingsMutation.mutateAsync({
          targetMonthlyBudget: parseFloat(settingsQuery.data.targetMonthlyBudget),
          maxMonthlyBudget: parseFloat(settingsQuery.data.maxMonthlyBudget),
          preferredCurrency: nextVal,
          themeMode: theme,
          themeAccent: accent,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const changeTheme = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (settingsQuery.data) {
      try {
        await updateSettingsMutation.mutateAsync({
          targetMonthlyBudget: parseFloat(settingsQuery.data.targetMonthlyBudget),
          maxMonthlyBudget: parseFloat(settingsQuery.data.maxMonthlyBudget),
          preferredCurrency: displayCurrency,
          themeMode: newTheme,
          themeAccent: accent,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const changeAccent = async (newAccent: string) => {
    setAccent(newAccent);
    if (settingsQuery.data) {
      try {
        await updateSettingsMutation.mutateAsync({
          targetMonthlyBudget: parseFloat(settingsQuery.data.targetMonthlyBudget),
          maxMonthlyBudget: parseFloat(settingsQuery.data.maxMonthlyBudget),
          preferredCurrency: displayCurrency,
          themeMode: theme,
          themeAccent: newAccent,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const saveSettings = async (updates: {
    targetMonthlyBudget: number;
    maxMonthlyBudget: number;
    preferredCurrency: string;
    themeMode: "light" | "dark";
    themeAccent: string;
    notifyBudget80?: boolean;
    notifyRecurrentApplied?: boolean;
    notifyFriendActions?: boolean;
  }) => {
    await updateSettingsMutation.mutateAsync(updates);
  };

  const convertCurrency = (amount: number, from: string, to: string) => {
    if (!rates?.[from] || !rates[to]) return amount;
    const amountInEur = from === "EUR" ? amount : amount / rates[from];
    return to === "EUR" ? amountInEur : amountInEur * rates[to];
  };

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/EUR");
        if (res.ok) {
          const data = await res.json();
          if (data.rates) {
            setRates(data.rates);
            setIsRateFetched(true);
            if (data.rates.NOK) setExchangeRate(data.rates.NOK);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchRate();
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        displayCurrency,
        setDisplayCurrency,
        exchangeRate,
        rates,
        convertCurrency,
        isRateFetched,
        user,
        settings: settingsQuery.data || null,
        refetchSettings: () => { settingsQuery.refetch(); },
        theme,
        changeTheme,
        accent,
        changeAccent,
        saveSettings,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function DashboardLayout({ children, user }: DashboardProviderProps) {
  return (
    <DashboardProvider user={user}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { displayCurrency } = useDashboard();

  const navLinks = [
    { label: "Overview", href: "/", icon: Home },
    { label: "Transazioni", href: "/transactions", icon: CreditCard },
    { label: "Liste Spesa", href: "/todos", icon: CheckSquare },
    { label: "Statistiche", href: "/analytics", icon: BarChart3 },
    { label: "Amici", href: "/friends", icon: Users },
  ];

  return (
    <div className="relative min-h-screen bg-transparent text-[var(--foreground)] flex flex-col transition-colors duration-500">
      <header className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl bg-[var(--card-solid)] border border-[var(--card-border)] rounded-full shadow-lg h-14 z-50 transition-colors duration-300">
        <div className="w-full px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Image src="/logo.png" alt="Gravio" width={28} height={28} className="rounded-xl" />
            <span className="font-bold text-sm tracking-tight">Gravio</span>
          </div>

          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-neutral-500/10",
                    isActive
                      ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm hover:bg-[var(--foreground)] hover:opacity-90"
                      : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  <Icon size={13} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 select-none">
              Valuta: {displayCurrency}
            </div>
            <NotificationBell />
            <Link
              href="/settings"
              className={cn(
                "text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-full h-9 w-9 flex items-center justify-center transition-all",
                pathname === "/settings" && "bg-[var(--foreground)] text-[var(--background)]",
              )}
            >
              <Settings size={15} />
            </Link>
          </div>
        </div>
      </header>

      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-[var(--card-border)] bg-[var(--card-solid)] flex items-center justify-between px-4 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Gravio" width={24} height={24} className="rounded-lg" />
          <span className="font-bold text-xs">Gravio</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 mr-1 select-none">
            {displayCurrency}
          </div>
          <NotificationBell />
          <Link
            href="/settings"
            className={cn(
              "text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-full h-8 w-8 flex items-center justify-center transition-all",
              pathname === "/settings" && "bg-[var(--foreground)] text-[var(--background)]",
            )}
          >
            <Settings size={14} />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:pt-24 pt-14 pb-24 md:pb-8">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col">
          {children}
        </div>
      </div>

      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 rounded-full border border-[var(--card-border)] bg-[var(--card-solid)]/90 backdrop-blur-md shadow-2xl transition-all duration-300">
        <div className="flex justify-around items-center h-14 px-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-11 rounded-full gap-0.5 text-[9px] font-bold transition-all",
                  isActive ? "text-blue-500" : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
                )}
              >
                <Icon size={15} className={cn("transition-transform", isActive && "scale-105")} />
                <span className="text-[8px] tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
