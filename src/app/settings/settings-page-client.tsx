"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc/client";
import { BudgetTab } from "./components/budget-tab";
import { GeneralTab } from "./components/general-tab";
import { NotificationsTab } from "./components/notifications-tab";
import { ProfileTab } from "./components/profile-tab";
import { SettingsHeader } from "./components/settings-header";
import { SettingsTabs, type Tab } from "./components/settings-tabs";

const handleLogout = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/login";
      },
    },
  });
};

const VALID_TABS: Tab[] = ["general", "budget", "profile", "notifications"];

type SettingsFormState = {
  preferredCurrency: string;
  targetBudget: string;
  maxBudget: string;
  notifyBudget80: boolean;
  notifyRecurrentApplied: boolean;
  notifyFriendActions: boolean;
  profileName: string;
  profileImage: string | null;
  catBudgets: Record<string, string>;
  isSaving: boolean;
};

type SettingsFormAction =
  | { type: "SET_FIELD"; field: keyof SettingsFormState; value: any }
  | { type: "SET_FIELDS"; fields: Partial<SettingsFormState> };

function settingsFormReducer(state: SettingsFormState, action: SettingsFormAction): SettingsFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

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

  const toDisplayCurrency = useCallback(
    (nokVal: number): number => convertCurrency(nokVal, "NOK", displayCurrency),
    [convertCurrency, displayCurrency],
  );

  const [activeTab, setActiveTab] = useState<Tab>(
    rawTab && VALID_TABS.includes(rawTab) ? rawTab : "general",
  );

  const [formState, dispatch] = useReducer(
    settingsFormReducer,
    null as any,
    () => ({
      preferredCurrency: displayCurrency,
      targetBudget: settings ? toDisplayCurrency(parseFloat(settings.targetMonthlyBudget)).toFixed(2) : "0.00",
      maxBudget: settings ? toDisplayCurrency(parseFloat(settings.maxMonthlyBudget)).toFixed(2) : "0.00",
      notifyBudget80: settings?.notifyBudget80 ?? true,
      notifyRecurrentApplied: settings?.notifyRecurrentApplied ?? true,
      notifyFriendActions: settings?.notifyFriendActions ?? true,
      profileName: user.name || "",
      profileImage: user.image || null,
      catBudgets: {},
      isSaving: false,
    })
  ) as [SettingsFormState, React.Dispatch<SettingsFormAction>];

  const {
    preferredCurrency,
    targetBudget,
    maxBudget,
    notifyBudget80,
    notifyRecurrentApplied,
    notifyFriendActions,
    profileName,
    profileImage,
    catBudgets,
    isSaving,
  } = formState;

  const setPreferredCurrency = (val: string) => dispatch({ type: "SET_FIELD", field: "preferredCurrency", value: val });
  const setIsSaving = (val: boolean) => dispatch({ type: "SET_FIELD", field: "isSaving", value: val });
  const setNotifyBudget80 = (val: boolean) => dispatch({ type: "SET_FIELD", field: "notifyBudget80", value: val });
  const setNotifyRecurrentApplied = (val: boolean) => dispatch({ type: "SET_FIELD", field: "notifyRecurrentApplied", value: val });
  const setNotifyFriendActions = (val: boolean) => dispatch({ type: "SET_FIELD", field: "notifyFriendActions", value: val });
  const setProfileName = (val: string) => dispatch({ type: "SET_FIELD", field: "profileName", value: val });
  const setProfileImage = (val: string | null) => dispatch({ type: "SET_FIELD", field: "profileImage", value: val });
  const setCatBudgets = (val: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => {
    if (typeof val === "function") {
      dispatch({ type: "SET_FIELD", field: "catBudgets", value: val(catBudgets) });
    } else {
      dispatch({ type: "SET_FIELD", field: "catBudgets", value: val });
    }
  };
  const setTargetBudget = (val: string) => dispatch({ type: "SET_FIELD", field: "targetBudget", value: val });
  const setMaxBudget = (val: string) => dispatch({ type: "SET_FIELD", field: "maxBudget", value: val });

  const [_permissionVersion, setPermissionVersion] = useState(0);
  // Read Notification.permission on demand; permissionVersion bump triggers re-read
  const pushNotificationPermission = useSyncExternalStore<
    NotificationPermission | "unsupported" | "default"
  >(
    () => () => {},
    () => {
      // eslint-disable-next-line no-unused-expressions
      _permissionVersion; // tracked so a state bump re-evaluates this
      if (!("Notification" in window)) return "unsupported";
      return Notification.permission;
    },
    () => "default",
  );
  const handlePermissionChange = useCallback(() => {
    setPermissionVersion((v) => v + 1);
  }, []);

  const trpc = useTRPC();
  const updateProfileMutation = useMutation(
    trpc.settings.updateProfile.mutationOptions(),
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

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery(
    trpc.category.list.queryOptions(),
  );
  const { data: categoryBudgetsData } = useQuery(
    trpc.categoryBudget.list.queryOptions(),
  );
  const setCategoryBudgetMutation = useMutation(
    trpc.categoryBudget.set.mutationOptions(),
  );

  const toNok = useCallback(
    (displayVal: number): number =>
      convertCurrency(displayVal, displayCurrency, "NOK"),
    [convertCurrency, displayCurrency],
  );

  useEffect(() => {
    if (categoryBudgetsData) {
      const budgetMap: Record<string, string> = {};
      for (const cb of categoryBudgetsData) {
        budgetMap[cb.categoryId] = toDisplayCurrency(
          parseFloat(cb.amount),
        ).toFixed(2);
      }
      dispatch({ type: "SET_FIELD", field: "catBudgets", value: budgetMap });
    }
  }, [categoryBudgetsData, toDisplayCurrency, dispatch]);

  const prevSettingsRef = useRef<typeof settings | null>(null);
  if (settings !== prevSettingsRef.current) {
    prevSettingsRef.current = settings;
    if (settings) {
      dispatch({
        type: "SET_FIELDS",
        fields: {
          targetBudget: toDisplayCurrency(parseFloat(settings.targetMonthlyBudget)).toFixed(2),
          maxBudget: toDisplayCurrency(parseFloat(settings.maxMonthlyBudget)).toFixed(2),
          preferredCurrency: settings.preferredCurrency,
          notifyBudget80: settings.notifyBudget80 ?? true,
          notifyRecurrentApplied: settings.notifyRecurrentApplied ?? true,
          notifyFriendActions: settings.notifyFriendActions ?? true,
        },
      });
    }
  }

  const prevUserRef = useRef<typeof user | null>(null);
  if (user !== prevUserRef.current) {
    prevUserRef.current = user;
    if (user) {
      dispatch({
        type: "SET_FIELDS",
        fields: {
          profileName: user.name || "",
          profileImage: user.image || null,
        },
      });
    }
  }

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

      if (categoriesData) {
        await Promise.all(
          categoriesData.map((cat) =>
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
      <SettingsHeader onSave={handleSave} isSaving={isSaving} />

      {/* Horizontal tab bar */}
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <m.div
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
              categories={categoriesData ?? []}
              isCategoriesLoading={isCategoriesLoading}
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
              onPermissionChange={handlePermissionChange}
            />
          )}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
