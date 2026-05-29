"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Camera,
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
  Trash2,
  User,
  X,
} from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  notifyBudget80?: boolean;
  notifyRecurrentApplied?: boolean;
  notifyFriendActions?: boolean;
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
    notifyBudget80: boolean;
    notifyRecurrentApplied: boolean;
    notifyFriendActions: boolean;
  }) => Promise<void>;
  initialTab?: "general" | "budget" | "profile" | "notifications";
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
  const [activeTab, setActiveTab] = useState<
    "general" | "budget" | "profile" | "notifications"
  >(initialTab ?? "general");

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab ?? "general");
  }, [isOpen, initialTab]);
  const { convertCurrency } = useDashboard();
  const [preferredCurrency, setPreferredCurrency] =
    useState<string>(displayCurrency);
  const [isSaving, setIsSaving] = useState(false);

  const [notifyBudget80, setNotifyBudget80] = useState(true);
  const [notifyRecurrentApplied, setNotifyRecurrentApplied] = useState(true);
  const [notifyFriendActions, setNotifyFriendActions] = useState(true);

  const router = useRouter();
  const updateProfileMutation = trpc.settings.updateProfile.useMutation();
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileImage, setProfileImage] = useState<string | null>(
    user.image || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProfileName(user.name || "");
      setProfileImage(user.image || null);
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = 128;
        canvas.width = size;
        canvas.height = size;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
        setProfileImage(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
      setNotifyBudget80(settings.notifyBudget80 ?? true);
      setNotifyRecurrentApplied(settings.notifyRecurrentApplied ?? true);
      setNotifyFriendActions(settings.notifyFriendActions ?? true);
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
        notifyBudget80,
        notifyRecurrentApplied,
        notifyFriendActions,
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

      if (profileName !== user.name || profileImage !== user.image) {
        await updateProfileMutation.mutateAsync({
          name: profileName,
          image: profileImage,
        });
      }

      router.refresh();
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
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4 bg-black/70 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-transparent border-0 w-full h-full"
            onClick={onClose}
            aria-label="Chiudi"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full md:max-w-[780px] bg-[var(--card-solid)] border border-[var(--card-border)] shadow-2xl flex flex-col md:flex-row text-[var(--foreground)] z-10 rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden h-[92dvh] md:h-auto md:min-h-[500px]"
          >
            <div className="flex md:hidden justify-center pt-3 pb-0 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--card-border)]" />
            </div>

            <div className="flex md:hidden items-center justify-between px-6 pt-4 pb-3 border-b border-[var(--card-border)] shrink-0">
              <div className="flex items-center gap-2">
                <Settings
                  size={15}
                  className="text-blue-500 animate-spin-slow"
                />
                <span className="font-black text-sm tracking-tight">
                  Impostazioni
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-neutral-500/10 cursor-pointer bg-transparent border-0 transition-all"
                aria-label="Chiudi"
              >
                <X size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="hidden md:flex absolute top-4 right-4 h-8 w-8 rounded-full items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-neutral-500/10 cursor-pointer bg-transparent border-0 transition-all z-20"
              aria-label="Chiudi"
            >
              <X size={16} />
            </button>

            <div className="w-full md:w-[220px] bg-[var(--card-sidebar)] border-b md:border-b-0 md:border-r border-[var(--card-border)] p-5 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible select-none shrink-0 scrollbar-none">
              <div className="hidden md:flex items-center gap-2.5 mb-5 px-2">
                <Settings
                  size={18}
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
                  "flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer flex-1 md:flex-none md:w-full md:text-left bg-transparent shrink-0 hover:scale-[1.02] active:scale-[0.98]",
                  activeTab === "general"
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40 hover:text-[var(--foreground)]",
                )}
              >
                <Sliders size={15} />
                <span>Generali</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("budget")}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer flex-1 md:flex-none md:w-full md:text-left bg-transparent shrink-0 hover:scale-[1.02] active:scale-[0.98]",
                  activeTab === "budget"
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40 hover:text-[var(--foreground)]",
                )}
              >
                <DollarSign size={15} />
                <span>Limiti Budget</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer flex-1 md:flex-none md:w-full md:text-left bg-transparent shrink-0 hover:scale-[1.02] active:scale-[0.98]",
                  activeTab === "profile"
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40 hover:text-[var(--foreground)]",
                )}
              >
                <User size={15} />
                <span>Profilo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all border-0 cursor-pointer flex-1 md:flex-none md:w-full md:text-left bg-transparent shrink-0 hover:scale-[1.02] active:scale-[0.98]",
                  activeTab === "notifications"
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : "text-[var(--text-muted)] hover:bg-neutral-100 dark:hover:bg-zinc-800/40 hover:text-[var(--foreground)]",
                )}
              >
                <Bell size={15} />
                <span>Notifiche</span>
              </button>
            </div>

            <div className="flex-1 p-5 md:p-8 flex flex-col justify-between md:h-[560px] overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1.5 flex flex-col gap-6">
                {activeTab === "general" && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <h4 className="text-base font-black tracking-tight mb-1">
                        Visualizzazione & Stile
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        Modifica le preferenze estetiche dell'applicazione
                      </p>
                    </div>

                    <div className="bg-neutral-500/5 dark:bg-zinc-800/10 border border-[var(--card-border)]/60 rounded-[1.5rem] p-5 flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                          Valuta Preferita
                        </span>
                        <CurrencySelect
                          value={preferredCurrency}
                          onChange={setPreferredCurrency}
                          triggerClassName="h-11 text-xs rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                          Modalità Tema
                        </span>
                        <div className="flex rounded-xl bg-neutral-100 dark:bg-zinc-800/30 p-1 w-full border border-[var(--card-border)]/40">
                          <button
                            type="button"
                            onClick={() => changeTheme("light")}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-2 bg-transparent hover:text-[var(--foreground)]",
                              theme === "light"
                                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                                : "text-[var(--text-muted)]",
                            )}
                          >
                            <Sun size={13} /> Chiaro
                          </button>
                          <button
                            type="button"
                            onClick={() => changeTheme("dark")}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-2 bg-transparent hover:text-[var(--foreground)]",
                              theme === "dark"
                                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                                : "text-[var(--text-muted)]",
                            )}
                          >
                            <Moon size={13} /> Scuro
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                          Colore Accento
                        </span>
                        <div className="flex flex-wrap gap-3 p-3 bg-neutral-100/50 dark:bg-zinc-800/20 rounded-xl border border-[var(--card-border)]/40">
                          {ACCENT_COLORS.map((col) => (
                            <button
                              key={col.id}
                              type="button"
                              onClick={() => changeAccent(col.id)}
                              className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 border-0 shadow-sm"
                              style={{ backgroundColor: col.primary }}
                            >
                              {accent === col.id && (
                                <Check
                                  size={15}
                                  className="text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.4)] font-bold"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "budget" && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <h4 className="text-base font-black tracking-tight mb-1">
                        Limiti Budget Mensile
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        Imposta i tuoi obiettivi di spesa mensili in{" "}
                        <span className="font-extrabold text-blue-500">
                          {displayCurrency}
                        </span>
                      </p>
                    </div>

                    <div className="bg-neutral-500/5 dark:bg-zinc-800/10 border border-[var(--card-border)]/60 rounded-[1.5rem] p-5 flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                            Budget Target (Obiettivo)
                          </span>
                          <MoneyInput
                            value={targetBudget}
                            onChange={setTargetBudget}
                            currency={displayCurrency}
                            className="h-11"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                            Budget Massimo (Limite)
                          </span>
                          <MoneyInput
                            value={maxBudget}
                            onChange={setMaxBudget}
                            currency={displayCurrency}
                            className="h-11"
                          />
                        </div>
                      </div>

                      {displayCurrency === "EUR" && (
                        <div className="flex items-start gap-2.5 text-[10px] text-[var(--text-muted)] bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                          <Info
                            size={13}
                            className="flex-shrink-0 mt-0.5 text-blue-500"
                          />
                          <span>
                            I valori vengono convertiti in NOK al salvataggio
                            usando il tasso di cambio corrente (
                            {exchangeRate.toFixed(2)} NOK/EUR)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <h5 className="text-xs font-black mb-0.5">
                          Budget per Categoria
                        </h5>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Imposta limiti specifici per categoria di spesa
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                        {categoriesQuery.isLoading ? (
                          <div className="text-xs text-[var(--text-muted)] py-4 text-center font-bold col-span-2">
                            Caricamento...
                          </div>
                        ) : categoriesQuery.data &&
                          categoriesQuery.data.length > 0 ? (
                          categoriesQuery.data.map((cat) => (
                            <div
                              key={cat.id}
                              className="flex items-center justify-between gap-3 bg-neutral-500/5 dark:bg-zinc-800/10 border border-[var(--card-border)]/50 rounded-2xl p-2.5"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                                  style={{ backgroundColor: cat.color }}
                                >
                                  <CategoryIcon name={cat.icon} size={13} />
                                </div>
                                <span className="text-[11px] font-bold text-[var(--foreground)] truncate">
                                  {cat.name}
                                </span>
                              </div>
                              <div className="w-[110px] flex-shrink-0">
                                <MoneyInput
                                  value={catBudgets[cat.id] || "0.00"}
                                  onChange={(newVal) => {
                                    setCatBudgets((prev) => ({
                                      ...prev,
                                      [cat.id]: newVal,
                                    }));
                                  }}
                                  currency={displayCurrency}
                                  className="h-8 text-[11px]"
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-[var(--text-muted)] py-4 text-center font-bold col-span-2">
                            Nessuna categoria
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="flex flex-col gap-6">
                    <div>
                      <h4 className="text-base font-black tracking-tight mb-1">
                        Informazioni Profilo
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        Gestisci le tue informazioni personali e l'immagine del
                        profilo
                      </p>
                    </div>

                    <div className="flex flex-col gap-6 p-6 bg-neutral-500/5 dark:bg-zinc-800/10 border border-[var(--card-border)]/60 rounded-[1.5rem] items-center">
                      <button
                        type="button"
                        className="relative group cursor-pointer border-0 p-0 bg-transparent rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-blue-500/30 bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-3xl uppercase shadow-md transition-all duration-300 group-hover:border-blue-500/60">
                          {profileImage ? (
                            <NextImage
                              src={profileImage}
                              alt={profileName}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{profileName ? profileName[0] : "S"}</span>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity duration-200">
                          <Camera size={18} className="mb-1" />
                          <span>Cambia foto</span>
                        </div>
                      </button>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {profileImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileImage(null);
                          }}
                          className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors bg-transparent border-0 cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          Rimuovi foto
                        </button>
                      )}

                      <div className="w-full flex flex-col gap-4 mt-2">
                        <div className="flex flex-col gap-1.5 text-left">
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                            Nome Profilo
                          </span>
                          <input
                            type="text"
                            placeholder="Il tuo nome"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                            className="h-11 px-3.5 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-[var(--card-border)] outline-none text-xs font-bold text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus-within:ring-2 focus-within:ring-blue-500/20"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 text-left opacity-75">
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider ml-1">
                            Indirizzo Email
                          </span>
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="h-11 w-full px-3.5 bg-neutral-500/10 dark:bg-zinc-800/50 rounded-xl border border-[var(--card-border)] outline-none text-xs font-bold text-[var(--text-muted)] cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="w-full border-t border-[var(--card-border)]/40 my-2" />

                      <button
                        type="button"
                        onClick={onLogout}
                        className="text-rose-500 hover:bg-rose-500/10 text-xs font-bold rounded-2xl h-10 px-5 cursor-pointer flex items-center justify-center gap-2 border border-rose-500/20 bg-transparent transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <LogOut size={14} />
                        Disconnetti Account
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <h4 className="text-base font-black tracking-tight mb-1">
                        Preferenze Notifiche
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        Scegli quando ricevere notifiche in-app
                      </p>
                    </div>

                    <div className="bg-neutral-500/5 dark:bg-zinc-800/10 border border-[var(--card-border)]/60 rounded-[1.5rem] p-5 flex flex-col divide-y divide-[var(--card-border)]/40">
                      {(
                        [
                          {
                            label: "Avvisi Budget",
                            description:
                              "Notifica quando raggiungi l'80%, il 100% o il massimo del budget mensile",
                            checked: notifyBudget80,
                            onChange: setNotifyBudget80,
                          },
                          {
                            label: "Transazioni Ricorrenti",
                            description:
                              "Notifica quando le transazioni ricorrenti vengono elaborate automaticamente",
                            checked: notifyRecurrentApplied,
                            onChange: setNotifyRecurrentApplied,
                          },
                          {
                            label: "Azioni Amici",
                            description:
                              "Notifica quando un amico aggiunge una spesa condivisa con te",
                            checked: notifyFriendActions,
                            onChange: setNotifyFriendActions,
                          },
                        ] as {
                          label: string;
                          description: string;
                          checked: boolean;
                          onChange: (v: boolean) => void;
                        }[]
                      ).map(({ label, description, checked, onChange }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-xs font-bold text-[var(--foreground)]">
                              {label}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                              {description}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onChange(!checked)}
                            className={cn(
                              "relative h-6 w-11 rounded-full transition-colors shrink-0 border-0 cursor-pointer",
                              checked
                                ? "bg-blue-500"
                                : "bg-neutral-400/30 dark:bg-zinc-700/60",
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                                checked
                                  ? "left-[calc(100%-1.375rem)]"
                                  : "left-0.5",
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6 pt-5 border-t border-[var(--card-border)] shrink-0 bg-[var(--card-solid)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-100 dark:hover:bg-zinc-800/50 text-xs font-bold rounded-2xl h-11 cursor-pointer bg-transparent transition-all"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 text-xs font-black rounded-2xl h-11 cursor-pointer flex items-center justify-center gap-2 border-0 disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Salva</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
