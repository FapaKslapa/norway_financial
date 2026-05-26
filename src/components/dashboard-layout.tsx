"use client";

import { Button } from "@heroui/react";
import {
  BarChart3,
  CheckSquare,
  CreditCard,
  Landmark,
  Palette,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { trpc } from "../lib/trpc/client";
import { cn } from "../lib/utils";
import {
  SettingsDialog,
  type UserSettingsType,
} from "./settings/settings-dialog";
import { useTheme } from "./theme-provider";

type DashboardContextType = {
  displayCurrency: "EUR" | "NOK";
  setDisplayCurrency: (
    val: "EUR" | "NOK" | ((prev: "EUR" | "NOK") => "EUR" | "NOK"),
  ) => void;
  exchangeRate: number;
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
    preferredCurrency: "EUR" | "NOK";
    themeMode: "light" | "dark";
    themeAccent: string;
  }) => Promise<void>;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
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
  const [displayCurrency, setDisplayCurrencyRaw] = useState<"EUR" | "NOK">(
    "NOK",
  );
  const [exchangeRate, setExchangeRate] = useState<number>(11.85);
  const [isRateFetched, setIsRateFetched] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, setTheme, accent, setAccent } = useTheme();

  const settingsQuery = trpc.settings.get.useQuery();
  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      settingsQuery.refetch();
    },
  });

  useEffect(() => {
    const localVal = localStorage.getItem("preferred_currency");
    if (localVal === "EUR" || localVal === "NOK") {
      setDisplayCurrencyRaw(localVal);
    }
  }, []);

  useEffect(() => {
    if (settingsQuery.data) {
      const dbCurrency = settingsQuery.data.preferredCurrency as "EUR" | "NOK";
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

  const setDisplayCurrency = async (
    val: "EUR" | "NOK" | ((prev: "EUR" | "NOK") => "EUR" | "NOK"),
  ) => {
    let nextVal: "EUR" | "NOK";
    if (typeof val === "function") {
      nextVal = val(displayCurrency);
    } else {
      nextVal = val;
    }

    setDisplayCurrencyRaw(nextVal);
    localStorage.setItem("preferred_currency", nextVal);

    if (settingsQuery.data) {
      try {
        await updateSettingsMutation.mutateAsync({
          targetMonthlyBudget: parseFloat(
            settingsQuery.data.targetMonthlyBudget,
          ),
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
          targetMonthlyBudget: parseFloat(
            settingsQuery.data.targetMonthlyBudget,
          ),
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
          targetMonthlyBudget: parseFloat(
            settingsQuery.data.targetMonthlyBudget,
          ),
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
    preferredCurrency: "EUR" | "NOK";
    themeMode: "light" | "dark";
    themeAccent: string;
  }) => {
    await updateSettingsMutation.mutateAsync(updates);
  };

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/EUR");
        if (res.ok) {
          const data = await res.json();
          if (data.rates?.NOK) {
            setExchangeRate(data.rates.NOK);
            setIsRateFetched(true);
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
        isRateFetched,
        user,
        settings: settingsQuery.data || null,
        refetchSettings: () => {
          settingsQuery.refetch();
        },
        theme,
        changeTheme,
        accent,
        changeAccent,
        saveSettings,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function DashboardLayout({ children, user }: DashboardProviderProps) {
  return (
    <DashboardProvider user={user}>
      <DashboardLayoutContent user={user}>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}

function DashboardLayoutContent({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const pathname = usePathname();
  const _router = useRouter();
  const {
    displayCurrency,
    theme,
    changeTheme,
    accent,
    changeAccent,
    settings,
    saveSettings,
    isSettingsOpen,
    setIsSettingsOpen,
  } = useDashboard();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  const navLinks = [
    { label: "Overview", href: "/", icon: Landmark },
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
            <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500">
              <Landmark size={16} />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Erasmus Finance
            </span>
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

            <Button
              isIconOnly
              variant="ghost"
              onPress={() => setIsSettingsOpen(true)}
              className="text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-full h-9 w-9 min-w-9 cursor-pointer flex items-center justify-center"
            >
              <Palette size={15} />
            </Button>
          </div>
        </div>
      </header>

      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-[var(--card-border)] bg-[var(--card-solid)] flex items-center justify-between px-4 z-40 transition-colors duration-300">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-500">
            <Landmark size={14} />
          </div>
          <span className="font-bold text-xs">Erasmus Finance</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 mr-1 select-none">
            {displayCurrency}
          </div>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() => setIsSettingsOpen(true)}
            className="text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-full h-8 w-8 min-w-8 cursor-pointer flex items-center justify-center"
          >
            <Palette size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:pt-24 pt-14 pb-20 md:pb-8">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col">
          {children}
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--card-border)] bg-[var(--card-solid)] shadow-[0_-4px_15px_rgba(0,0,0,0.05)] pb-safe transition-colors duration-300">
        <div className="flex justify-around items-center h-14">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[9px] font-semibold transition-all",
                  isActive
                    ? "text-blue-500 font-bold"
                    : "text-[var(--text-muted)]",
                )}
              >
                <Icon
                  size={16}
                  className={cn(
                    "transition-transform",
                    isActive && "scale-105",
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        theme={theme}
        changeTheme={changeTheme}
        accent={accent}
        changeAccent={changeAccent}
        onLogout={handleLogout}
        settings={settings}
        onSaveSettings={saveSettings}
      />
    </div>
  );
}
