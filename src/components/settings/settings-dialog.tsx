"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  DollarSign,
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
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { MoneyInput } from "../ui/money-input";

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
  onSaveSettings: (updates: {
    targetMonthlyBudget: number;
    maxMonthlyBudget: number;
    preferredCurrency: "EUR" | "NOK";
    themeMode: "light" | "dark";
    themeAccent: string;
  }) => Promise<void>;
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
  onSaveSettings,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<"general" | "budget" | "profile">(
    "general",
  );
  const [targetBudget, setTargetBudget] = useState("10000.00");
  const [maxBudget, setMaxBudget] = useState("12000.00");
  const [preferredCurrency, setPreferredCurrency] = useState<"EUR" | "NOK">(
    "NOK",
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setTargetBudget(parseFloat(settings.targetMonthlyBudget).toFixed(2));
      setMaxBudget(parseFloat(settings.maxMonthlyBudget).toFixed(2));
      setPreferredCurrency(settings.preferredCurrency as "EUR" | "NOK");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings({
        targetMonthlyBudget: parseFloat(targetBudget) || 10000,
        maxMonthlyBudget: parseFloat(maxBudget) || 12000,
        preferredCurrency,
        themeMode: theme,
        themeAccent: accent,
      });
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
            <div className="w-full md:w-[180px] bg-[var(--card-sidebar)] border-b md:border-b-0 md:border-r border-[var(--card-border)] p-5 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible select-none shrink-0 scrollbar-none">
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
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer w-full text-left bg-transparent",
                  activeTab === "general"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40",
                )}
              >
                <Sliders size={14} />
                <span>Generali</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("budget")}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer w-full text-left bg-transparent",
                  activeTab === "budget"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40",
                )}
              >
                <DollarSign size={14} />
                <span>Limiti Budget</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer w-full text-left bg-transparent",
                  activeTab === "profile"
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40",
                )}
              >
                <User size={14} />
                <span>Profilo</span>
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
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Valuta Preferita
                      </span>
                      <div className="flex rounded-xl bg-neutral-100 dark:bg-zinc-800/30 p-1 w-full">
                        <button
                          type="button"
                          onClick={() => setPreferredCurrency("NOK")}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer bg-transparent",
                            preferredCurrency === "NOK"
                              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                              : "text-[var(--text-muted)]",
                          )}
                        >
                          NOK
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferredCurrency("EUR")}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer bg-transparent",
                            preferredCurrency === "EUR"
                              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                              : "text-[var(--text-muted)]",
                          )}
                        >
                          EUR
                        </button>
                      </div>
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
                        Imposta i tuoi obiettivi di spesa mensili in NOK
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Budget Target (Obiettivo)
                      </span>
                      <MoneyInput
                        value={targetBudget}
                        onChange={setTargetBudget}
                        currency="NOK"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Budget Massimo (Limite)
                      </span>
                      <MoneyInput
                        value={maxBudget}
                        onChange={setMaxBudget}
                        currency="NOK"
                      />
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

                      <Button
                        variant="ghost"
                        onPress={onLogout}
                        className="text-rose-500 hover:bg-rose-500/15 text-xs font-bold rounded-xl h-9 px-4 cursor-pointer mt-2 flex items-center gap-1.5 border-0"
                      >
                        <LogOut size={13} />
                        Disconnetti Account
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-6 pt-4 border-t border-[var(--card-border)]">
                <Button
                  variant="ghost"
                  onPress={onClose}
                  className="flex-1 text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-100 dark:hover:bg-zinc-800/50 text-xs font-bold rounded-xl h-10 cursor-pointer"
                >
                  Annulla
                </Button>
                <Button
                  onPress={handleSave}
                  isDisabled={isSaving}
                  className="flex-1 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 text-xs font-bold rounded-xl h-10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>Salva</span>
                </Button>
              </div>
            </div>

            <Button
              isIconOnly
              variant="ghost"
              onPress={onClose}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/50 hover:text-[var(--foreground)] h-7 w-7 rounded-lg border-0 cursor-pointer flex items-center justify-center z-20"
            >
              <X size={15} />
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
