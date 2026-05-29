"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Camera,
  Check,
  ChevronLeft,
  DollarSign,
  Info,
  Loader2,
  LogOut,
  Moon,
  Save,
  Sliders,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import NextImage from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CategoryIcon } from "@/components/icon-helper";
import { CurrencySelect } from "@/components/ui/currency-select";
import { MoneyInput } from "@/components/ui/money-input";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export const ACCENT_COLORS = [
  { id: "blue", name: "Apple Blue", primary: "#007aff" },
  { id: "green", name: "Emerald Green", primary: "#34c759" },
  { id: "purple", name: "Royal Purple", primary: "#af52de" },
  { id: "orange", name: "Sunset Orange", primary: "#ff9500" },
  { id: "red", name: "Crimson Red", primary: "#ff3b30" },
];

type Tab = "general" | "budget" | "profile" | "notifications";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "general", label: "Generali", Icon: Sliders },
  { id: "budget", label: "Budget", Icon: DollarSign },
  { id: "profile", label: "Profilo", Icon: User },
  { id: "notifications", label: "Notifiche", Icon: Bell },
];

const VALID_TABS: Tab[] = ["general", "budget", "profile", "notifications"];

export function SettingsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") as Tab | null;

  const {
    displayCurrency,
    convertCurrency,
    settings,
    theme,
    changeTheme,
    accent,
    changeAccent,
    user,
    saveSettings,
    exchangeRate,
    refetchSettings,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<Tab>(
    rawTab && VALID_TABS.includes(rawTab) ? rawTab : "general",
  );
  const [preferredCurrency, setPreferredCurrency] =
    useState<string>(displayCurrency);
  const [isSaving, setIsSaving] = useState(false);
  const [notifyBudget80, setNotifyBudget80] = useState(true);
  const [notifyRecurrentApplied, setNotifyRecurrentApplied] = useState(true);
  const [notifyFriendActions, setNotifyFriendActions] = useState(true);
  const [pushNotificationPermission, setPushNotificationPermission] = useState<
    NotificationPermission | "unsupported" | "default"
  >("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("Notification" in window)) {
        setPushNotificationPermission("unsupported");
      } else {
        setPushNotificationPermission(Notification.permission);
      }
    }
  }, []);

  const updateProfileMutation = trpc.settings.updateProfile.useMutation();
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileImage, setProfileImage] = useState<string | null>(
    user.image || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setProfileImage(canvas.toDataURL("image/jpeg", 0.5));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const categoriesQuery = trpc.category.list.useQuery();
  const categoryBudgetsQuery = trpc.categoryBudget.list.useQuery();
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
        budgetMap[cb.categoryId] = toDisplayCurrency(
          parseFloat(cb.amount),
        ).toFixed(2);
      }
      setCatBudgets(budgetMap);
    }
  }, [categoryBudgetsQuery.data, toDisplayCurrency]);

  const [targetBudget, setTargetBudget] = useState(() =>
    settings
      ? toDisplayCurrency(parseFloat(settings.targetMonthlyBudget)).toFixed(2)
      : "0.00",
  );
  const [maxBudget, setMaxBudget] = useState(() =>
    settings
      ? toDisplayCurrency(parseFloat(settings.maxMonthlyBudget)).toFixed(2)
      : "0.00",
  );

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

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileImage(user.image || null);
    }
  }, [user]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings({
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
          categoriesQuery.data.map((cat) =>
            setCategoryBudgetMutation.mutateAsync({
              categoryId: cat.id,
              amount: toNok(parseFloat(catBudgets[cat.id] || "0") || 0),
            }),
          ),
        );
      }

      if (profileName !== user.name || profileImage !== user.image) {
        await updateProfileMutation.mutateAsync({
          name: profileName,
          image: profileImage,
        });
      }

      refetchSettings();
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between gap-4 select-none"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full border border-(--card-border) flex items-center justify-center text-(--text-muted) hover:text-foreground hover:bg-neutral-500/10 cursor-pointer bg-(--card-solid) transition-all shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider hidden md:block">
              Account
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight leading-none">
              Impostazioni
            </h2>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="bg-foreground text-background hover:opacity-90 text-xs font-black rounded-2xl h-10 px-5 cursor-pointer flex items-center gap-2 border-0 disabled:opacity-50 transition-opacity shadow-sm shrink-0"
        >
          {isSaving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          <span className="hidden sm:inline">Salva Impostazioni</span>
          <span className="sm:hidden">Salva</span>
        </motion.button>
      </motion.div>

      {/* Horizontal tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="flex rounded-[1.25rem] bg-neutral-500/5 dark:bg-zinc-800/20 border border-(--card-border) p-1 w-full select-none"
      >
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[0.9rem] text-xs font-extrabold transition-all border-0 cursor-pointer bg-transparent",
              activeTab === id
                ? "bg-foreground text-background shadow-sm"
                : "text-(--text-muted) hover:text-foreground",
            )}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Currency */}
              <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl shrink-0">
                    <DollarSign size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Valuta Preferita</p>
                    <p className="text-[10px] text-(--text-muted)">
                      Usata in tutta l'app
                    </p>
                  </div>
                </div>
                <CurrencySelect
                  value={preferredCurrency}
                  onChange={setPreferredCurrency}
                  triggerClassName="h-11 text-xs rounded-xl"
                />
              </div>

              {/* Theme */}
              <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0">
                    <Sun size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Modalità Tema</p>
                    <p className="text-[10px] text-(--text-muted)">
                      Chiaro o scuro
                    </p>
                  </div>
                </div>
                <div className="flex rounded-xl bg-neutral-100 dark:bg-zinc-800/30 p-1 border border-(--card-border)/40">
                  <button
                    type="button"
                    onClick={() => changeTheme("light")}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-2 bg-transparent",
                      theme === "light"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-(--text-muted) hover:text-foreground",
                    )}
                  >
                    <Sun size={13} /> Chiaro
                  </button>
                  <button
                    type="button"
                    onClick={() => changeTheme("dark")}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer flex items-center justify-center gap-2 bg-transparent",
                      theme === "dark"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-(--text-muted) hover:text-foreground",
                    )}
                  >
                    <Moon size={13} /> Scuro
                  </button>
                </div>
              </div>

              {/* Accent colors — full width */}
              <div className="md:col-span-2 bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-500 rounded-xl shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Colore Accento</p>
                    <p className="text-[10px] text-(--text-muted)">
                      Colore principale dell'interfaccia
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {ACCENT_COLORS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => changeAccent(col.id)}
                      className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 group"
                    >
                      <div
                        className="h-10 w-10 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm"
                        style={{ backgroundColor: col.primary }}
                      >
                        {accent === col.id && (
                          <Check
                            size={16}
                            className="text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.4)]"
                          />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[9px] font-bold transition-colors",
                          accent === col.id
                            ? "text-foreground"
                            : "text-(--text-muted)",
                        )}
                      >
                        {col.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="flex flex-col gap-4">
              {/* Global budget */}
              <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl shrink-0">
                    <DollarSign size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Budget Mensile Globale</p>
                    <p className="text-[10px] text-(--text-muted)">
                      Obiettivi di spesa in{" "}
                      <span className="font-extrabold text-blue-500">
                        {displayCurrency}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
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
                    <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
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
                  <div className="flex items-start gap-2.5 text-[10px] text-(--text-muted) bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                    <Info
                      size={13}
                      className="shrink-0 mt-0.5 text-blue-500"
                    />
                    <span>
                      I valori vengono convertiti in NOK al salvataggio al tasso
                      corrente ({exchangeRate.toFixed(2)} NOK/EUR)
                    </span>
                  </div>
                )}
              </div>

              {/* Per-category budget */}
              <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0">
                    <Sliders size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Budget per Categoria</p>
                    <p className="text-[10px] text-(--text-muted)">
                      Limiti di spesa per ogni categoria
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoriesQuery.isLoading ? (
                    <div className="text-xs text-(--text-muted) py-6 text-center font-bold col-span-2">
                      Caricamento...
                    </div>
                  ) : categoriesQuery.data &&
                    categoriesQuery.data.length > 0 ? (
                    categoriesQuery.data.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 bg-neutral-500/5 border border-(--card-border)/40 rounded-2xl p-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} size={14} />
                          </div>
                          <span className="text-xs font-bold text-foreground truncate">
                            {cat.name}
                          </span>
                        </div>
                        <div className="w-[110px] shrink-0">
                          <MoneyInput
                            value={catBudgets[cat.id] || "0.00"}
                            onChange={(newVal) =>
                              setCatBudgets((prev) => ({
                                ...prev,
                                [cat.id]: newVal,
                              }))
                            }
                            currency={displayCurrency}
                            className="h-9 text-[11px]"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-(--text-muted) py-6 text-center font-bold col-span-2">
                      Nessuna categoria creata
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Avatar + name */}
              <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl shrink-0">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Informazioni Personali</p>
                    <p className="text-[10px] text-(--text-muted)">
                      Nome e foto profilo
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    className="relative group cursor-pointer border-0 p-0 bg-transparent rounded-full outline-none"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-blue-500/30 bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-2xl uppercase shadow-md transition-all group-hover:border-blue-500/60">
                      {profileImage ? (
                        <NextImage
                          src={profileImage}
                          alt={profileName}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{profileName ? profileName[0] : "S"}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                      <Camera size={16} className="mb-0.5" />
                      <span>Cambia</span>
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
                      onClick={() => setProfileImage(null)}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-600 bg-transparent border-0 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Rimuovi foto
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
                      Nome
                    </span>
                    <input
                      type="text"
                      placeholder="Il tuo nome"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="h-11 px-3.5 bg-neutral-500/5 dark:bg-zinc-800/30 rounded-xl border border-(--card-border) outline-none text-xs font-bold text-foreground placeholder:text-(--text-muted) focus-within:ring-2 focus-within:ring-blue-500/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 opacity-70">
                    <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
                      Email
                    </span>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="h-11 w-full px-3.5 bg-neutral-500/10 dark:bg-zinc-800/50 rounded-xl border border-(--card-border) outline-none text-xs font-bold text-(--text-muted) cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Account actions */}
              <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl shrink-0">
                    <LogOut size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">Account</p>
                    <p className="text-[10px] text-(--text-muted)">
                      Azioni sull'account
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4 p-4 bg-neutral-500/5 rounded-2xl border border-(--card-border)/40">
                    <div>
                      <p className="text-xs font-bold">{user.name}</p>
                      <p className="text-[10px] text-(--text-muted) truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-black text-sm uppercase shrink-0">
                      {profileImage ? (
                        <NextImage
                          src={profileImage}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        (user.name?.[0] ?? "U")
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-rose-500 hover:bg-rose-500/10 text-xs font-bold rounded-2xl h-11 cursor-pointer flex items-center justify-center gap-2 border border-rose-500/20 bg-transparent transition-all"
                  >
                    <LogOut size={14} />
                    Disconnetti Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-0 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-2 border-b border-(--card-border)">
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl shrink-0">
                  <Bell size={14} />
                </div>
                <div>
                  <p className="text-xs font-black">Preferenze Notifiche</p>
                  <p className="text-[10px] text-(--text-muted)">
                    Scegli quando ricevere notifiche in-app
                  </p>
                </div>
              </div>

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
                  ...(pushNotificationPermission !== "unsupported"
                    ? [
                        {
                          label: "Notifiche Native Browser",
                          description:
                            pushNotificationPermission === "granted"
                              ? "Le notifiche native sul tuo dispositivo sono attive"
                              : "Abilita le notifiche push direttamente sul tuo dispositivo",
                          checked: pushNotificationPermission === "granted",
                          onChange: async (checked: boolean) => {
                            if (checked) {
                              const permission =
                                await Notification.requestPermission();
                              setPushNotificationPermission(permission);
                              if (
                                permission === "granted" &&
                                "serviceWorker" in navigator
                              ) {
                                navigator.serviceWorker.ready.then((reg) => {
                                  reg.showNotification("Notifiche Attivate", {
                                    body: "Riceverai le notifiche push di Gravio direttamente su questo dispositivo.",
                                    icon: "/icon-192.png",
                                    badge: "/favicon-32.png",
                                  });
                                });
                              }
                            } else {
                              alert(
                                "Per disabilitare del tutto le notifiche, gestisci i permessi del sito dal lucchetto nella barra degli indirizzi del browser.",
                              );
                            }
                          },
                        },
                      ]
                    : []),
                ] as {
                  label: string;
                  description: string;
                  checked: boolean;
                  onChange: (v: boolean) => void;
                }[]
              ).map(({ label, description, checked, onChange }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-6 py-4 border-b border-(--card-border)/40 last:border-0"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold text-foreground">
                      {label}
                    </span>
                    <span className="text-[10px] text-(--text-muted) leading-relaxed">
                      {description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange(!checked)}
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors shrink-0 border-0 cursor-pointer",
                      checked
                        ? "bg-blue-500"
                        : "bg-neutral-300 dark:bg-zinc-700",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                        checked ? "left-[calc(100%-1.375rem)]" : "left-1",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
