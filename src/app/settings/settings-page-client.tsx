"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  DollarSign,
  Loader2,
  Save,
  Sliders,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { BudgetTab } from "./components/budget-tab";
import { GeneralTab } from "./components/general-tab";
import { NotificationsTab } from "./components/notifications-tab";
import { ProfileTab } from "./components/profile-tab";

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
            <GeneralTab
              preferredCurrency={preferredCurrency}
              setPreferredCurrency={setPreferredCurrency}
              theme={theme}
              changeTheme={changeTheme}
              accent={accent}
              changeAccent={changeAccent}
            />
          )}

          {activeTab === "budget" && (
            <BudgetTab
              targetBudget={targetBudget}
              setTargetBudget={setTargetBudget}
              maxBudget={maxBudget}
              setMaxBudget={setMaxBudget}
              displayCurrency={displayCurrency}
              exchangeRate={exchangeRate}
              categories={categoriesQuery.data ?? []}
              isCategoriesLoading={categoriesQuery.isLoading}
              catBudgets={catBudgets}
              setCatBudgets={setCatBudgets}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              profileName={profileName}
              setProfileName={setProfileName}
              profileImage={profileImage}
              setProfileImage={setProfileImage}
              user={user}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              handleLogout={handleLogout}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              notifyBudget80={notifyBudget80}
              setNotifyBudget80={setNotifyBudget80}
              notifyRecurrentApplied={notifyRecurrentApplied}
              setNotifyRecurrentApplied={setNotifyRecurrentApplied}
              notifyFriendActions={notifyFriendActions}
              setNotifyFriendActions={setNotifyFriendActions}
              pushNotificationPermission={pushNotificationPermission}
              setPushNotificationPermission={setPushNotificationPermission}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
