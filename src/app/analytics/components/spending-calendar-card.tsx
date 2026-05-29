"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn, formatCurrency } from "@/lib/utils";

const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const MONTH_SHORT = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

type SpendingCalendarCardProps = {
  currentMonth: number;
  currentYear: number;
  dailyExpensesMap: Record<number, number>;
  maxDailyExpense: number;
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  displayCurrency: string;
};

export function SpendingCalendarCard({
  currentMonth,
  currentYear,
  dailyExpensesMap,
  maxDailyExpense,
  selectedDay,
  setSelectedDay,
  displayCurrency,
}: SpendingCalendarCardProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    day: number;
    amount: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex =
    (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const spacers = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-4 md:p-6 apple-widget w-full md:h-full flex flex-col">
      <CardHeader className="p-0 pb-3 border-b border-(--card-border) mb-4 md:mb-6 flex flex-col items-start gap-1 shrink-0">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <CalendarIcon size={14} className="text-blue-500" />
          Calendario di Spesa
        </h4>
        <p className="text-[10px] text-(--text-muted)">
          L'intensità del colore mostra i giorni con maggiore spesa. Clicca su
          un giorno per filtrare.
        </p>
      </CardHeader>

      <CardContent className="p-0 flex-grow flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-7 gap-1 md:gap-1.5 text-center select-none">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
            <span
              key={day}
              className="text-[9px] font-black uppercase tracking-wider text-(--text-muted) py-1"
            >
              {day}
            </span>
          ))}

          {spacers.map((spacer) => (
            <div key={`spacer-${spacer}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const dailyExpense = dailyExpensesMap[day] || 0;
            const isSelected = selectedDay === day;

            let heatOpacity = 0;
            if (dailyExpense > 0) {
              heatOpacity = 0.15 + (dailyExpense / maxDailyExpense) * 0.85;
            }

            const dayStyle =
              dailyExpense > 0
                ? { backgroundColor: `rgba(0, 122, 255, ${heatOpacity})` }
                : {};

            return (
              <button
                type="button"
                key={`day-${day}`}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                onMouseEnter={(e) =>
                  dailyExpense > 0 &&
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    day,
                    amount: dailyExpense,
                  })
                }
                onMouseMove={(e) =>
                  dailyExpense > 0 &&
                  setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
                  )
                }
                onMouseLeave={() => setTooltip(null)}
                style={dayStyle}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center p-1 cursor-pointer relative transition-all duration-200 border border-transparent bg-transparent",
                  dailyExpense === 0
                    ? "bg-neutral-500/5 hover:bg-neutral-500/10 text-foreground"
                    : "text-white font-extrabold",
                  isSelected
                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-(--card)"
                    : "",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] leading-none",
                    dailyExpense > 0
                      ? "text-white font-bold"
                      : "text-(--text-muted)",
                  )}
                >
                  {day}
                </span>
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div className="flex flex-col gap-1.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3 mt-1 select-none">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-bold text-blue-500">
                Spesa del {selectedDay} {MONTH_NAMES[currentMonth]}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-[9px] text-(--text-muted) hover:text-foreground font-bold cursor-pointer bg-transparent border-0"
              >
                Mostra tutto il mese
              </button>
            </div>
            <div className="text-xs font-black text-foreground">
              {formatCurrency(
                dailyExpensesMap[selectedDay] || 0,
                displayCurrency,
              )}
            </div>
          </div>
        )}
      </CardContent>

      {mounted &&
        tooltip &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2.5 py-1.5 rounded-xl text-[9px] font-bold shadow-lg whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
          >
            {tooltip.day} {MONTH_SHORT[currentMonth]}:{" "}
            {formatCurrency(tooltip.amount, displayCurrency)}
          </div>,
          document.body,
        )}
    </Card>
  );
}
