"use client";

import { m } from "framer-motion";
import { Bell, DollarSign, Sliders, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "general" | "budget" | "profile" | "notifications";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "general", label: "Generali", Icon: Sliders },
  { id: "budget", label: "Budget", Icon: DollarSign },
  { id: "profile", label: "Profilo", Icon: User },
  { id: "notifications", label: "Notifiche", Icon: Bell },
];

type SettingsTabsProps = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
};

export function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  return (
    <m.div
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
    </m.div>
  );
}
