"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  className?: string;
};

export function NotificationBell({ className }: NotificationBellProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notificationsQuery = trpc.notification.list.useQuery(undefined, {
    refetchInterval: 15 * 1000,
  });

  const refetch = () => notificationsQuery.refetch();

  const markReadMutation = trpc.notification.markRead.useMutation({
    onSuccess: refetch,
  });
  const markAllReadMutation = trpc.notification.markAllRead.useMutation({
    onSuccess: refetch,
  });
  const deleteMutation = trpc.notification.delete.useMutation({
    onSuccess: refetch,
  });
  const deleteAllMutation = trpc.notification.deleteAll.useMutation({
    onSuccess: refetch,
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [prevIds, setPrevIds] = useState<string[]>([]);

  useEffect(() => {
    if (notificationsQuery.isSuccess && notificationsQuery.data) {
      const currentIds = notificationsQuery.data.map((n) => n.id);
      const isDifferent =
        currentIds.length !== prevIds.length ||
        currentIds.some((id, index) => id !== prevIds[index]);

      if (isDifferent) {
        if (prevIds.length > 0) {
          const newUnread = notificationsQuery.data.filter(
            (n) => !n.read && !prevIds.includes(n.id),
          );

          if (
            newUnread.length > 0 &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            for (const n of newUnread) {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready
                  .then((reg) => {
                    reg.showNotification(n.title, {
                      body: n.message,
                      icon: "/icon-192.png",
                      badge: "/favicon-32.png",
                      data: { link: n.link || "/" },
                      vibrate: [100, 50, 100],
                    } as unknown as NotificationOptions & {
                      vibrate?: number[];
                    });
                  })
                  .catch(() => {
                    new Notification(n.title, {
                      body: n.message,
                      icon: "/icon-192.png",
                    });
                  });
              } else {
                new Notification(n.title, {
                  body: n.message,
                  icon: "/icon-192.png",
                });
              }
            }
          }
        }
        setPrevIds(currentIds);
      }
    }
  }, [notificationsQuery.data, notificationsQuery.isSuccess, prevIds]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-foreground border border-(--card-border) hover:bg-neutral-500/10 rounded-full h-9 w-9 min-w-9 cursor-pointer flex items-center justify-center transition-all bg-transparent"
        aria-label="Notifiche"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 bg-(--card-solid) border border-(--card-border) shadow-2xl rounded-2xl overflow-hidden z-[100] flex flex-col text-foreground"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--card-border) bg-neutral-500/5">
              <span className="text-xs font-black uppercase tracking-wider">
                Notifiche
              </span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-[9px] font-bold text-blue-500 hover:underline cursor-pointer border-0 bg-transparent"
                  >
                    Segna lette
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => deleteAllMutation.mutate()}
                    className="text-[9px] font-bold text-rose-500 hover:underline cursor-pointer border-0 bg-transparent"
                  >
                    Elimina tutte
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-(--text-muted)">
                  <BellOff size={20} className="mb-2 opacity-40" />
                  <span className="text-[10px] font-medium">
                    Nessuna notifica
                  </span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`group flex items-start gap-2 p-3 border-b border-(--card-border)/50 transition-all last:border-b-0 ${
                      n.read
                        ? "opacity-60 hover:opacity-100"
                        : "bg-blue-500/5 hover:bg-blue-500/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.read) markReadMutation.mutate({ id: n.id });
                        if (n.link) {
                          setIsOpen(false);
                          router.push(n.link);
                        }
                      }}
                      className="flex-1 flex flex-col gap-1 text-left outline-none bg-transparent border-0 cursor-pointer min-w-0"
                    >
                      <span className="text-[10px] font-extrabold leading-tight">
                        {n.title}
                      </span>
                      <p className="text-[9px] text-(--text-muted) leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[8px] text-(--text-muted) font-medium w-full">
                        <span>
                          {dayjs(n.createdAt).format("DD MMM, HH:mm")}
                        </span>
                        {n.link && (
                          <span className="text-blue-500">Visualizza</span>
                        )}
                      </div>
                    </button>
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate({ id: n.id })}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-rose-500/10 text-(--text-muted) hover:text-rose-400 transition-all bg-transparent border-0 cursor-pointer"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
