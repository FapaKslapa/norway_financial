"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
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

  const markReadMutation = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
  });

  const markAllReadMutation = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const handleMarkRead = async (id: string) => {
    await markReadMutation.mutateAsync({ id });
  };

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-[var(--foreground)] border border-[var(--card-border)] hover:bg-neutral-500/10 rounded-full h-9 w-9 min-w-9 cursor-pointer flex items-center justify-center transition-all bg-transparent"
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
            className="absolute right-0 mt-2 w-80 bg-[var(--card-solid)] border border-[var(--card-border)] shadow-2xl rounded-2xl overflow-hidden z-[100] flex flex-col text-[var(--foreground)]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)] bg-neutral-500/5">
              <span className="text-xs font-black uppercase tracking-wider">
                Notifiche
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[9px] font-bold text-blue-500 hover:underline cursor-pointer border-0 bg-transparent"
                >
                  Segna come lette
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-[var(--card-border)]/50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-[var(--text-muted)]">
                  <BellOff size={20} className="mb-2 opacity-40" />
                  <span className="text-[10px] font-medium">
                    Nessuna notifica
                  </span>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => {
                      if (!n.read) handleMarkRead(n.id);
                      if (n.link) {
                        setIsOpen(false);
                        router.push(n.link);
                      }
                    }}
                    className={`p-3 flex flex-col gap-1 transition-all outline-none text-left w-full border-0 bg-transparent cursor-pointer ${
                      n.read
                        ? "opacity-60 hover:opacity-100"
                        : "bg-blue-500/5 hover:bg-blue-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <span className="text-[10px] font-extrabold leading-tight">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[8px] text-[var(--text-muted)] font-medium w-full">
                      <span>{dayjs(n.createdAt).format("DD MMM, HH:mm")}</span>
                      {n.link && (
                        <span className="text-blue-500 hover:underline">
                          Visualizza
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
