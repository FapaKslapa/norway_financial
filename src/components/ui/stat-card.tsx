"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string | ReactNode;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  valueClassName?: string;
  delayIndex?: number;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
  className,
  valueClassName,
  delayIndex = 0,
}: StatCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delayIndex * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-5 apple-widget flex flex-col justify-between select-none cursor-default",
        className,
      )}
    >
      <div className="flex justify-between items-center w-full">
        <span className="text-xs text-(--text-muted) font-semibold">
          {title}
        </span>
        <div
          className={cn(
            "p-1.5 rounded-lg shrink-0 flex items-center justify-center",
            iconBgColor,
            iconColor,
          )}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 w-full overflow-hidden">
        {typeof value === "string" || typeof value === "number" ? (
          <h3
            className={cn(
              "text-2xl font-black tracking-tight text-foreground truncate w-full",
              String(value).length > 15 && "text-base",
              String(value).length > 11 &&
                String(value).length <= 15 &&
                "text-lg",
              valueClassName,
            )}
            title={String(value)}
          >
            {value}
          </h3>
        ) : (
          value
        )}
        {subtitle && (
          <div className="text-[10px] text-(--text-muted) mt-1">{subtitle}</div>
        )}
      </div>
    </m.div>
  );
}
