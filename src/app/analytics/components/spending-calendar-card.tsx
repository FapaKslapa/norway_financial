"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn, formatCurrency } from "../../../lib/utils";

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
  displayCurrency: "NOK" | "EUR";
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
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex =
    (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const spacers = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget w-full">
      <CardHeader className="p-0 pb-4 border-b border-[var(--card-border)] mb-6 flex flex-col items-start gap-1">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <CalendarIcon size={14} className="text-blue-500" />
          Calendario di Spesa
        </h4>
        <p className="text-[10px] text-[var(--text-muted)]">
          L'intensità del colore mostra i giorni con maggiore spesa. Clicca su
          un giorno per filtrare.
        </p>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-1.5 text-center select-none">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
            <span
              key={day}
              className="text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] py-1"
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
                style={dayStyle}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 cursor-pointer relative group transition-all duration-200 border border-transparent bg-transparent",
                  dailyExpense === 0
                    ? "bg-neutral-500/5 hover:bg-neutral-500/10 text-[var(--foreground)]"
                    : "text-white font-extrabold",
                  isSelected
                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[var(--card)]"
                    : "",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] leading-none self-start",
                    dailyExpense > 0
                      ? "text-white"
                      : "text-[var(--text-muted)]",
                  )}
                >
                  {day}
                </span>

                {dailyExpense > 0 && (
                  <span className="text-[8px] leading-none font-black truncate max-w-full text-center">
                    {dailyExpense > 999
                      ? `${(dailyExpense / 1000).toFixed(0)}k`
                      : dailyExpense.toFixed(0)}
                  </span>
                )}

                <div className="absolute bottom-full mb-1 bg-[var(--foreground)] text-[var(--background)] px-2 py-1 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-25 whitespace-nowrap shadow-md">
                  {day} {MONTH_SHORT[currentMonth]}:{" "}
                  {formatCurrency(dailyExpense, displayCurrency)}
                </div>
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div className="flex justify-between items-center bg-blue-500/5 border border-blue-500/10 rounded-2xl p-3.5 mt-2">
            <span className="text-xs font-bold text-blue-500">
              Stai visualizzando solo il giorno {selectedDay}{" "}
              {MONTH_NAMES[currentMonth]}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] font-bold cursor-pointer bg-transparent border-0"
            >
              Mostra tutto il mese
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
