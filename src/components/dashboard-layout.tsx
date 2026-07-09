"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
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
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTRPC } from "@/lib/trpc/client";
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

const preferredCurrencyStore = {
  listeners: new Set<() => void>(),
  subscribe(onStoreChange: () => void) {
    preferredCurrencyStore.listeners.add(onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
      preferredCurrencyStore.listeners.delete(onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  },
  getSnapshot() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("preferred_currency") || "EUR";
    }
    return "EUR";
  },
  getServerSnapshot() {
    return "EUR";
  },
  set(val: string) {
    localStorage.setItem("preferred_currency", val);
    preferredCurrencyStore.listeners.forEach((listener) => listener());
  },
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = use(DashboardContext);
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

function DashboardProvider({ children, user }: DashboardProviderProps) {
  const displayCurrency = useSyncExternalStore(
    preferredCurrencyStore.subscribe,
    preferredCurrencyStore.getSnapshot,
    preferredCurrencyStore.getServerSnapshot,
  );

  const { data: ratesData } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR");
      if (!res.ok) throw new Error("Failed to fetch rates");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const rates = useMemo(
    () =>
      (ratesData?.rates || { EUR: 1, NOK: 11.85 }) as Record<string, number>,
    [ratesData?.rates],
  );
  const isRateFetched = !!ratesData?.rates;
  const exchangeRate = ratesData?.rates?.NOK ?? 11.85;
  const { theme, setTheme, accent, setAccent } = useTheme();

  const trpc = useTRPC();
  const { data: settingsData, refetch: refetchSettings } = useQuery(
    trpc.settings.get.queryOptions(),
  );
  const updateSettingsMutation = useMutation(
    trpc.settings.update.mutationOptions({
      onSuccess: () => {
        refetchSettings();
      },
    }),
  );

  const hasProcessed = useRef(false);
  const processDueRecurrentMutation = useMutation(
    trpc.recurrentTransaction.processDue.mutationOptions(),
  );

  useEffect(() => {
    if (isRateFetched && !hasProcessed.current) {
      hasProcessed.current = true;
      processDueRecurrentMutation.mutate({ rates });
    }
  }, [isRateFetched, rates, processDueRecurrentMutation]);

  useEffect(() => {
    if (settingsData) {
      const dbCurrency = settingsData.preferredCurrency;
      preferredCurrencyStore.set(dbCurrency);
      localStorage.setItem("preferred_currency", dbCurrency);
      if (settingsData.themeMode) {
        setTheme(settingsData.themeMode as "light" | "dark");
      }
      if (settingsData.themeAccent) {
        setAccent(settingsData.themeAccent);
      }
    }
  }, [settingsData, setTheme, setAccent]);

  const setDisplayCurrency = useCallback(
    async (val: string | ((prev: string) => string)) => {
      const nextVal = typeof val === "function" ? val(displayCurrency) : val;
      preferredCurrencyStore.set(nextVal);
      if (settingsData) {
        try {
          await updateSettingsMutation.mutateAsync({
            targetMonthlyBudget: parseFloat(settingsData.targetMonthlyBudget),
            maxMonthlyBudget: parseFloat(settingsData.maxMonthlyBudget),
            preferredCurrency: nextVal,
            themeMode: theme,
            themeAccent: accent,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [displayCurrency, settingsData, theme, accent, updateSettingsMutation],
  );

  const changeTheme = useCallback(
    async (newTheme: "light" | "dark") => {
      setTheme(newTheme);
      if (settingsData) {
        try {
          await updateSettingsMutation.mutateAsync({
            targetMonthlyBudget: parseFloat(settingsData.targetMonthlyBudget),
            maxMonthlyBudget: parseFloat(settingsData.maxMonthlyBudget),
            preferredCurrency: displayCurrency,
            themeMode: newTheme,
            themeAccent: accent,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [settingsData, displayCurrency, accent, updateSettingsMutation, setTheme],
  );

  const changeAccent = useCallback(
    async (newAccent: string) => {
      setAccent(newAccent);
      if (settingsData) {
        try {
          await updateSettingsMutation.mutateAsync({
            targetMonthlyBudget: parseFloat(settingsData.targetMonthlyBudget),
            maxMonthlyBudget: parseFloat(settingsData.maxMonthlyBudget),
            preferredCurrency: displayCurrency,
            themeMode: theme,
            themeAccent: newAccent,
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [settingsData, displayCurrency, theme, updateSettingsMutation, setAccent],
  );

  const saveSettings = useCallback(
    async (updates: {
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
    },
    [updateSettingsMutation],
  );

  const convertCurrency = useCallback(
    (amount: number, from: string, to: string) => {
      if (!rates?.[from] || !rates[to]) return amount;
      const amountInEur = from === "EUR" ? amount : amount / rates[from];
      return to === "EUR" ? amountInEur : amountInEur * rates[to];
    },
    [rates],
  );

  const contextValue = useMemo(
    () => ({
      displayCurrency,
      setDisplayCurrency,
      exchangeRate,
      rates,
      convertCurrency,
      isRateFetched,
      user,
      settings: settingsData || null,
      refetchSettings: () => {
        refetchSettings();
      },
      theme,
      changeTheme,
      accent,
      changeAccent,
      saveSettings,
    }),
    [
      displayCurrency,
      setDisplayCurrency,
      exchangeRate,
      rates,
      convertCurrency,
      isRateFetched,
      user,
      settingsData,
      refetchSettings,
      theme,
      changeTheme,
      accent,
      changeAccent,
      saveSettings,
    ],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
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

const NAV_LINKS = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Transazioni", href: "/transactions", icon: CreditCard },
  { label: "Liste Spesa", href: "/todos", icon: CheckSquare },
  { label: "Statistiche", href: "/analytics", icon: BarChart3 },
  { label: "Amici", href: "/friends", icon: Users },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { displayCurrency } = useDashboard();

  return (
    <div className="relative min-h-screen bg-transparent text-foreground flex flex-col transition-colors duration-500">
      <header className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl bg-(--card) backdrop-blur-md border border-(--card-border) rounded-full shadow-lg h-14 z-50 transition-colors duration-300">
        <div className="w-full px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="Gravio"
              width={28}
              height={28}
              className="rounded-xl"
            />
            <span className="font-bold text-sm tracking-tight">Gravio</span>
          </div>

          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-neutral-500/10",
                    isActive
                      ? "bg-foreground text-background shadow-sm hover:bg-foreground hover:opacity-90"
                      : "text-(--text-muted) hover:text-foreground",
                  )}
                >
                  <Icon size={13} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 select-none">
              Valuta: {displayCurrency}
            </div>
            <NotificationBell />
            <Link
              href="/settings"
              className={cn(
                "text-foreground border border-(--card-border) hover:bg-neutral-500/10 rounded-full h-9 w-9 flex items-center justify-center transition-all",
                pathname === "/settings" && "bg-foreground text-background",
              )}
            >
              <Settings size={15} />
            </Link>
          </div>
        </div>
      </header>

      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-(--card-border) bg-(--card) backdrop-blur-md flex items-center justify-between px-4 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Gravio"
            width={24}
            height={24}
            className="rounded-lg"
          />
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
              "text-foreground border border-(--card-border) hover:bg-neutral-500/10 rounded-full h-8 w-8 flex items-center justify-center transition-all",
              pathname === "/settings" && "bg-foreground text-background",
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

      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 rounded-full border border-(--card-border) bg-(--card-solid)/90 backdrop-blur-md shadow-2xl transition-all duration-300">
        <div className="flex justify-around items-center h-14 px-1.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-11 rounded-full gap-0.5 text-[9px] font-bold transition-all",
                  isActive
                    ? "text-blue-500"
                    : "text-(--text-muted) hover:text-foreground",
                )}
              >
                <Icon
                  size={15}
                  className={cn(
                    "transition-transform",
                    isActive && "scale-105",
                  )}
                />
                <span className="text-[8px] tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
