"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

type AnalyticsHeaderProps = {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: (month: number, year: number) => void;
};

export function AnalyticsHeader({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
}: AnalyticsHeaderProps) {
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentYear);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative w-full">
      <div>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <TrendingUp size={24} className="text-blue-500" />
          Analisi Finanziaria
        </h2>
        <p className="text-[var(--text-muted)] text-xs">
          Monitora l'andamento del tuo budget, risparmi e categorie di spesa
        </p>
      </div>

      <div className="relative z-40">
        <div className="flex items-center bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-1 shadow-sm select-none">
          <Button
            isIconOnly
            variant="ghost"
            className="h-8 w-8 text-[var(--foreground)] hover:bg-neutral-500/10 rounded-xl border-0 cursor-pointer bg-transparent"
            onPress={onPrevMonth}
          >
            <ChevronLeft size={16} />
          </Button>

          <button
            type="button"
            onClick={() => {
              setPickerYear(currentYear);
              setIsMonthPickerOpen(!isMonthPickerOpen);
            }}
            className="px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-500/10 rounded-xl transition-all cursor-pointer border-0 bg-transparent text-[var(--foreground)] outline-none"
          >
            <CalendarIcon size={14} className="text-blue-500" />
            <span>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <ChevronDown
              size={12}
              className={cn(
                "transition-transform duration-200",
                isMonthPickerOpen && "rotate-180",
              )}
            />
          </button>

          <Button
            isIconOnly
            variant="ghost"
            className="h-8 w-8 text-[var(--foreground)] hover:bg-neutral-500/10 rounded-xl border-0 cursor-pointer bg-transparent"
            onPress={onNextMonth}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        <AnimatePresence>
          {isMonthPickerOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default bg-transparent border-0"
                onClick={() => setIsMonthPickerOpen(false)}
                aria-label="Chiudi selettore mese"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute left-0 md:left-auto md:right-0 mt-2 w-72 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--card-border)] p-4 rounded-3xl shadow-2xl z-50"
              >
                <div className="flex justify-between items-center pb-3 border-b border-[var(--card-border)] mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Scegli Mese
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      isIconOnly
                      variant="ghost"
                      className="h-6 w-6 text-[var(--foreground)] hover:bg-neutral-500/10 rounded-lg border-0 cursor-pointer bg-transparent"
                      onPress={() => setPickerYear((y) => y - 1)}
                    >
                      <ChevronLeft size={12} />
                    </Button>
                    <span className="text-xs font-extrabold">{pickerYear}</span>
                    <Button
                      isIconOnly
                      variant="ghost"
                      className="h-6 w-6 text-[var(--foreground)] hover:bg-neutral-500/10 rounded-lg border-0 cursor-pointer bg-transparent"
                      onPress={() => setPickerYear((y) => y + 1)}
                    >
                      <ChevronRight size={12} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {MONTH_SHORT.map((mShort, idx) => {
                    const isCurrent =
                      idx === currentMonth && pickerYear === currentYear;
                    return (
                      <button
                        key={mShort}
                        type="button"
                        onClick={() => {
                          onSelectMonth(idx, pickerYear);
                          setIsMonthPickerOpen(false);
                        }}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer",
                          isCurrent
                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "bg-neutral-500/5 text-[var(--foreground)] hover:bg-neutral-500/15",
                        )}
                      >
                        {mShort}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
