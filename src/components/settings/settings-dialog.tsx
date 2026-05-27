"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  DollarSign,
  Info,
  Loader2,
  LogOut,
  Moon,
  Save,
  Settings,
  Sliders,
  Sun,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategoryIcon } from "@/components/icon-helper";
import { CurrencySelect } from "@/components/ui/currency-select";
import { MoneyInput } from "@/components/ui/money-input";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export const ACCENT_COLORS = [
  { id: "blue", name: "Apple Blue", primary: "#007aff" },
  { id: "green", name: "Emerald Green", primary: "#34c759" },
  { id: "purple", name: "Royal Purple", primary: "#af52de" },
  { id: "orange", name: "Sunset Orange", primary: "#ff9500" },
  { id: "red", name: "Crimson Red", primary: "#ff3b30" },
];

export type UserSettingsType = {
  targetMonthlyBudget: string;
  maxMonthlyBudget: string;
  preferredCurrency: string;
  themeMode: string;
  themeAccent: string;
};

type SettingsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  theme: "light" | "dark";
  changeTheme: (theme: "light" | "dark") => void;
  accent: string;
  changeAccent: (accent: string) => void;
  onLogout: () => void;
  settings: UserSettingsType | null;
  displayCurrency: string;
  exchangeRate: number;
  onSaveSettings: (updates: {
    targetMonthlyBudget: number;
    maxMonthlyBudget: number;
    preferredCurrency: string;
    themeMode: "light" | "dark";
    themeAccent: string;
  }) => Promise<void>;
  initialTab?: "general" | "budget" | "profile";
};

export function SettingsDialog({
  isOpen,
  onClose,
  user,
  theme,
  changeTheme,
  accent,
  changeAccent,
  onLogout,
  settings,
  displayCurrency,
  exchangeRate,
  onSaveSettings,
  initialTab,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<"general" | "budget" | "profile">(
    initialTab ?? "general",
  );

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab ?? "general");
  }, [isOpen, initialTab]);
  const { convertCurrency } = useDashboard();
  const [preferredCurrency, setPreferredCurrency] =
    useState<string>(displayCurrency);
  const [isSaving, setIsSaving] = useState(false);

  const categoriesQuery = trpc.category.list.useQuery(undefined, {
    enabled: isOpen,
  });
  const categoryBudgetsQuery = trpc.categoryBudget.list.useQuery(undefined, {
    enabled: isOpen,
  });
  const setCategoryBudgetMutation = trpc.categoryBudget.set.useMutation();

  const [catBudgets, setCatBudgets] = useState<Record<string, string>>({});

  const toDisplayCurrency = useCallback(
    (nokVal: number): number => convertCurrency(nokVal, "NOK", displayCurrency),
    [convertCurrency, displayCurrency],
  );
  const toNok = useCallback(
    (displayVal: number): number =>
      convertCurrency(displayVal, displayCurrency, "NOK"),
    [convertCurrency, displayCurrency],
  );

  useEffect(() => {
    if (categoryBudgetsQuery.data) {
      const budgetMap: Record<string, string> = {};
      for (const cb of categoryBudgetsQuery.data) {
        const amountDisplay = toDisplayCurrency(parseFloat(cb.amount)).toFixed(
          2,
        );
        budgetMap[cb.categoryId] = amountDisplay;
      }
      setCatBudgets(budgetMap);
    }
  }, [categoryBudgetsQuery.data, toDisplayCurrency]);

  const [targetBudget, setTargetBudget] = useState(() => {
    if (!settings) return toDisplayCurrency(0).toFixed(2);
    return toDisplayCurrency(parseFloat(settings.targetMonthlyBudget)).toFixed(
      2,
    );
  });
  const [maxBudget, setMaxBudget] = useState(() => {
    if (!settings) return toDisplayCurrency(0).toFixed(2);
    return toDisplayCurrency(parseFloat(settings.maxMonthlyBudget)).toFixed(2);
  });

  useEffect(() => {
    if (settings) {
      setTargetBudget(
        toDisplayCurrency(parseFloat(settings.targetMonthlyBudget)).toFixed(2),
      );
      setMaxBudget(
        toDisplayCurrency(parseFloat(settings.maxMonthlyBudget)).toFixed(2),
      );
      setPreferredCurrency(settings.preferredCurrency);
    }
  }, [settings, toDisplayCurrency]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings({
        targetMonthlyBudget: toNok(parseFloat(targetBudget) || 0),
        maxMonthlyBudget: toNok(parseFloat(maxBudget) || 0),
        preferredCurrency,
        themeMode: theme,
        themeAccent: accent,
      });

      if (categoriesQuery.data) {
        await Promise.all(
          categoriesQuery.data.map((cat) => {
            const valStr = catBudgets[cat.id] || "0.00";
            const valNok = toNok(parseFloat(valStr) || 0);
            return setCategoryBudgetMutation.mutateAsync({
              categoryId: cat.id,
              amount: valNok,
            });
          }),
        );
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-transparent border-0 w-full h-full"
            onClick={onClose}
            aria-label="Chiudi"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[520px] bg-[var(--card-solid)] border border-[var(--card-border)] shadow-2xl flex flex-col md:flex-row text-[var(--foreground)] z-10 rounded-[2rem] overflow-hidden min-h-[400px]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-neutral-500/10 cursor-pointer bg-transparent border-0 transition-all z-20"
              aria-label="Chiudi"
            >
              <X size={15} />
            </button>

            <div className="w-full md:w-[180px] bg-[var(--card-sidebar)] border-b md:border-b-0 md:border-r border-[var(--card-border)] p-3 md:p-5 pr-12 md:pr-5 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible select-none shrink-0 scrollbar-none">
              <div className="hidden md:flex items-center gap-2 mb-4 px-2">
                <Settings
                  size={16}
                  className="text-blue-500 animate-spin-slow"
                />
                <span className="font-black text-xs uppercase tracking-wider">
                  Impostazioni
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex-1 md:flex-none md:w-full md:text-left bg-transparent shrink-0",
                  activeTab === "general"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40",
                )}
              >
                <Sliders size={14} />
                <span className="hidden md:inline">Generali</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("budget")}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex-1 md:flex-none md:w-full md:text-left bg-transparent shrink-0",
                  activeTab === "budget"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40",
                )}
              >
                <DollarSign size={14} />
                <span className="hidden md:inline">Limiti Budget</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex-1 md:flex-none md:w-full md:text-left bg-transparent shrink-0",
                  activeTab === "profile"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40",
                )}
              >
                <User size={14} />
                <span className="hidden md:inline">Profilo</span>
              </button>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-h-[60vh] md:max-h-[500px]">
              <div className="flex flex-col gap-4">
                {activeTab === "general" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold mb-1">
                        Visualizzazione & Stile
                      </h4>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        Modifica le preferenze estetiche dell'applicazione
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
                        Valuta Preferita
                      </span>
                      <CurrencySelect
                        value={preferredCurrency}
                        onChange={setPreferredCurrency}
                        triggerClassName="h-10 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Modalità Tema
                      </span>
                      <div className="flex rounded-xl bg-neutral-100 dark:bg-zinc-800/30 p-1 w-full">
                        <button
                          type="button"
                          onClick={() => changeTheme("light")}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 bg-transparent",
                            theme === "light"
                              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                              : "text-[var(--text-muted)]",
                          )}
                        >
                          <Sun size={12} /> Chiaro
                        </button>
                        <button
                          type="button"
                          onClick={() => changeTheme("dark")}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 bg-transparent",
                            theme === "dark"
                              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                              : "text-[var(--text-muted)]",
                          )}
                        >
                          <Moon size={12} /> Scuro
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Colore Accento
                      </span>
                      <div className="flex flex-wrap gap-2.5 p-3 bg-neutral-100 dark:bg-zinc-800/30 rounded-xl">
                        {ACCENT_COLORS.map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => changeAccent(col.id)}
                            className="h-7 w-7 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 border-0"
                            style={{ backgroundColor: col.primary }}
                          >
                            {accent === col.id && (
                              <Check
                                size={14}
                                className="text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.4)]"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "budget" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold mb-1">
                        Limiti Budget Mensile
                      </h4>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        Imposta i tuoi obiettivi di spesa mensili in{" "}
                        <span className="font-bold text-blue-500">
                          {displayCurrency}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Budget Target (Obiettivo) — {displayCurrency}
                      </span>
                      <MoneyInput
                        value={targetBudget}
                        onChange={setTargetBudget}
                        currency={displayCurrency}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Budget Massimo (Limite) — {displayCurrency}
                      </span>
                      <MoneyInput
                        value={maxBudget}
                        onChange={setMaxBudget}
                        currency={displayCurrency}
                      />
                    </div>

                    {displayCurrency === "EUR" && (
                      <div className="flex items-start gap-2 text-[9px] text-[var(--text-muted)] bg-neutral-500/5 border border-[var(--card-border)] rounded-xl p-2.5">
                        <Info
                          size={11}
                          className="flex-shrink-0 mt-0.5 opacity-60"
                        />
                        I valori vengono convertiti in NOK al salvataggio usando
                        il tasso di cambio corrente ({exchangeRate.toFixed(2)}{" "}
                        NOK/EUR)
                      </div>
                    )}

                    <div className="border-t border-[var(--card-border)] pt-4 mt-2 flex flex-col gap-3">
                      <div>
                        <h5 className="text-xs font-bold mb-0.5">
                          Budget per Categoria
                        </h5>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Imposta limiti specifici per categoria di spesa
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {categoriesQuery.isLoading ? (
                          <div className="text-[10px] text-[var(--text-muted)]">
                            Caricamento...
                          </div>
                        ) : categoriesQuery.data &&
                          categoriesQuery.data.length > 0 ? (
                          categoriesQuery.data.map((cat) => (
                            <div
                              key={cat.id}
                              className="flex items-center justify-between gap-3 bg-neutral-100/5 dark:bg-zinc-800/10 border border-[var(--card-border)]/50 rounded-xl p-2"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0"
                                  style={{ backgroundColor: cat.color }}
                                >
                                  <CategoryIcon name={cat.icon} size={11} />
                                </div>
                                <span className="text-[11px] font-semibold text-[var(--foreground)]">
                                  {cat.name}
                                </span>
                              </div>
                              <div className="w-[120px]">
                                <MoneyInput
                                  value={catBudgets[cat.id] || "0.00"}
                                  onChange={(newVal) => {
                                    setCatBudgets((prev) => ({
                                      ...prev,
                                      [cat.id]: newVal,
                                    }));
                                  }}
                                  currency={displayCurrency}
                                  className="h-8"
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-[var(--text-muted)]">
                            Nessuna categoria
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold mb-1">
                        Informazioni Profilo
                      </h4>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        I tuoi dati registrati nel sistema
                      </p>
                    </div>

                    <div className="flex flex-col gap-3.5 p-4 bg-neutral-100 dark:bg-zinc-800/30 rounded-2xl select-none items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xl uppercase shadow-inner">
                        {user.name ? user.name[0] : "S"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-[var(--foreground)]">
                          {user.name || "Studente"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                          {user.email}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={onLogout}
                        className="text-rose-500 hover:bg-rose-500/15 text-xs font-bold rounded-xl h-9 px-4 cursor-pointer mt-2 flex items-center justify-center gap-1.5 border-0 bg-transparent"
                      >
                        <LogOut size={13} />
                        Disconnetti Account
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-6 pt-4 border-t border-[var(--card-border)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-100 dark:hover:bg-zinc-800/50 text-xs font-bold rounded-xl h-10 cursor-pointer bg-transparent"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 text-xs font-bold rounded-xl h-10 cursor-pointer flex items-center justify-center gap-1.5 border-0 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>Salva</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/50 hover:text-[var(--foreground)] h-7 w-7 rounded-lg border-0 cursor-pointer flex items-center justify-center z-20 bg-transparent"
            >
              <X size={15} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
