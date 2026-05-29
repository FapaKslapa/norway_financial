"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationsTabProps = {
  notifyBudget80: boolean;
  setNotifyBudget80: (val: boolean) => void;
  notifyRecurrentApplied: boolean;
  setNotifyRecurrentApplied: (val: boolean) => void;
  notifyFriendActions: boolean;
  setNotifyFriendActions: (val: boolean) => void;
  pushNotificationPermission:
    | NotificationPermission
    | "unsupported"
    | "default";
  setPushNotificationPermission: (
    val: NotificationPermission | "unsupported" | "default",
  ) => void;
};

export function NotificationsTab({
  notifyBudget80,
  setNotifyBudget80,
  notifyRecurrentApplied,
  setNotifyRecurrentApplied,
  notifyFriendActions,
  setNotifyFriendActions,
  pushNotificationPermission,
  setPushNotificationPermission,
}: NotificationsTabProps) {
  const items = [
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
                const permission = await Notification.requestPermission();
                setPushNotificationPermission(permission);
                if (permission === "granted" && "serviceWorker" in navigator) {
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
  ];

  return (
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

      {items.map(({ label, description, checked, onChange }) => (
        <div
          key={label}
          className="flex items-center justify-between gap-6 py-4 border-b border-(--card-border)/40 last:border-0"
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-bold text-foreground">{label}</span>
            <span className="text-[10px] text-(--text-muted) leading-relaxed">
              {description}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors shrink-0 border-0 cursor-pointer",
              checked ? "bg-blue-500" : "bg-neutral-300 dark:bg-zinc-700",
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
  );
}
