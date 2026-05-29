"use client";

import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import "dayjs/locale/it";

dayjs.locale("it");

type CustomDatePickerProps = {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  placeholder?: string;
};

export function CustomDatePicker({
  value,
  onChange,
  className,
  triggerClassName,
  popoverClassName,
  placeholder,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  }>({});
  const [valign, setValign] = useState<"top" | "bottom">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const selectedDate = value ? dayjs(value) : dayjs();
  const [navDate, setNavDate] = useState(dayjs(selectedDate));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      const spaceOnRight = window.innerWidth - rect.left;
      const spaceOnBottom = window.innerHeight - rect.bottom;
      const spaceOnTop = rect.top;

      const newAlign = spaceOnRight < 260 ? "right" : "left";
      const newValign =
        spaceOnBottom < 280 && spaceOnTop > spaceOnBottom ? "top" : "bottom";

      setValign(newValign);
      setCoords({
        top: newValign === "bottom" ? rect.bottom + 6 : undefined,
        bottom:
          newValign === "top" ? window.innerHeight - rect.top + 6 : undefined,
        left: newAlign === "left" ? rect.left : undefined,
        right:
          newAlign === "right" ? window.innerWidth - rect.right : undefined,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      setNavDate(dayjs(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insideCalendar = calendarRef.current?.contains(target);
      if (!insideTrigger && !insideCalendar) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => setNavDate(navDate.subtract(1, "month"));
  const handleNextMonth = () => setNavDate(navDate.add(1, "month"));

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

  const formattedValue = value
    ? selectedDate.format("D MMMM YYYY")
    : placeholder || "Seleziona data...";

  const calendar = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={calendarRef}
          initial={{ opacity: 0, y: valign === "bottom" ? -4 : 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: valign === "bottom" ? -4 : 4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "fixed",
            zIndex: 9999,
            width: 256,
            ...coords,
          }}
          className={cn(
            "p-4 rounded-2xl border border-(--card-border) bg-(--card-solid) shadow-xl flex flex-col",
            popoverClassName,
          )}
        >
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-neutral-500/10 text-foreground cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold capitalize">
              {navDate.format("MMMM YYYY")}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-neutral-500/10 text-foreground cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-(--text-muted) font-extrabold uppercase mb-2">
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
                        : "hover:bg-neutral-500/10 text-foreground",
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
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* biome-ignore lint/a11y/useSemanticElements: nesting buttons is invalid HTML, so we use a div with role=button */}
      <div
        className={cn(
          "w-full h-11 px-3 rounded-xl flex items-center justify-between gap-2 text-xs bg-neutral-500/5 dark:bg-zinc-800/30 text-foreground hover:bg-neutral-500/10 dark:hover:bg-zinc-800/50 transition-all outline-none cursor-pointer border border-transparent focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 select-none",
          triggerClassName,
        )}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
          <CalendarIcon size={14} className="text-neutral-500 shrink-0" />
          <span className="truncate">{formattedValue}</span>
        </div>

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-neutral-400 hover:text-foreground hover:bg-neutral-500/10 rounded-full h-6 w-6 flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent shrink-0"
            aria-label="Resetta data"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {mounted && createPortal(calendar, document.body)}
    </div>
  );
}
