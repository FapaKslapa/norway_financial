"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "dayjs/locale/it";

dayjs.locale("it");

type CustomDatePickerProps = {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
};

export function CustomDatePicker({
  value,
  onChange,
  className,
  triggerClassName,
  popoverClassName,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? dayjs(value) : dayjs();
  const [navDate, setNavDate] = useState(dayjs(selectedDate));

  useEffect(() => {
    if (value) {
      setNavDate(dayjs(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setNavDate(navDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setNavDate(navDate.add(1, "month"));
  };

  const daysInMonth = navDate.daysInMonth();
  const firstDayIndex = navDate.startOf("month").day();
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const spacers = Array.from({ length: offset }, (_, i) => i);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) =>
    navDate.date(i + 1),
  );

  const handleSelectDay = (date: dayjs.Dayjs) => {
    onChange(date.format("YYYY-MM-DD"));
    setIsOpen(false);
  };

  const formattedValue = selectedDate.format("D MMMM YYYY");

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", isOpen ? "z-[60]" : "z-10", className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 px-3 rounded-xl flex items-center gap-2.5 text-xs bg-neutral-500/5 dark:bg-zinc-800/30 text-[var(--foreground)] hover:bg-neutral-500/10 dark:hover:bg-zinc-800/50 transition-all outline-none text-left cursor-pointer border-0 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/20",
          triggerClassName,
        )}
      >
        <CalendarIcon size={14} className="text-neutral-500 flex-shrink-0" />
        <span className="truncate">{formattedValue}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute left-0 z-[100] p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-solid)] shadow-xl w-64 flex flex-col",
              popoverClassName,
            )}
          >
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-neutral-500/10 text-[var(--foreground)] cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold capitalize">
                {navDate.format("MMMM YYYY")}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-neutral-500/10 text-[var(--foreground)] cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[var(--text-muted)] font-extrabold uppercase mb-2">
              <span>L</span>
              <span>M</span>
              <span>M</span>
              <span>G</span>
              <span>V</span>
              <span>S</span>
              <span>D</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {spacers.map((spacer) => (
                <div key={`spacer-${spacer}`} className="aspect-square" />
              ))}
              {dayCells.map((day) => {
                const isSelected = day.isSame(selectedDate, "day");
                const isToday = day.isSame(dayjs(), "day");

                return (
                  <button
                    key={day.format("YYYY-MM-DD")}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center text-[10px] cursor-pointer transition-all border border-transparent",
                      isSelected
                        ? "bg-blue-500 text-white font-bold"
                        : isToday
                          ? "border-blue-500 text-blue-500 font-bold"
                          : "hover:bg-neutral-500/10 text-[var(--foreground)]",
                    )}
                  >
                    {day.date()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
