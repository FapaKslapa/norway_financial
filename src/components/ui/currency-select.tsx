"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const ALL_CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "NOK", name: "Krone Norvegese" },
  { code: "USD", name: "Dollaro USA" },
  { code: "GBP", name: "Sterlina Britannica" },
  { code: "SEK", name: "Krona Svedese" },
  { code: "DKK", name: "Krone Danese" },
  { code: "CHF", name: "Franco Svizzero" },
  { code: "CAD", name: "Dollaro Canadese" },
  { code: "AUD", name: "Dollaro Australiano" },
  { code: "JPY", name: "Yen Giapponese" },
  { code: "CNY", name: "Yuan Cinese" },
  { code: "INR", name: "Rupia Indiana" },
  { code: "BRL", name: "Real Brasiliano" },
  { code: "MXN", name: "Peso Messicano" },
  { code: "SGD", name: "Dollaro di Singapore" },
  { code: "HKD", name: "Dollaro di Hong Kong" },
  { code: "KRW", name: "Won Sudcoreano" },
  { code: "PLN", name: "Zloty Polacco" },
  { code: "CZK", name: "Corona Ceca" },
  { code: "HUF", name: "Fiorino Ungherese" },
  { code: "RON", name: "Leu Romeno" },
  { code: "TRY", name: "Lira Turca" },
  { code: "ZAR", name: "Rand Sudafricano" },
  { code: "RUB", name: "Rublo Russo" },
  { code: "SAR", name: "Riyal Saudita" },
  { code: "AED", name: "Dirham EAU" },
  { code: "NZD", name: "Dollaro Neozelandese" },
  { code: "THB", name: "Baht Tailandese" },
  { code: "MYR", name: "Ringgit Malese" },
  { code: "IDR", name: "Rupia Indonesiana" },
];

type CurrencySelectProps = {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  triggerClassName?: string;
  currencies?: { code: string; name: string }[];
};

export function CurrencySelect({
  value,
  onChange,
  className,
  triggerClassName,
  currencies = ALL_CURRENCIES,
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : currencies;

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cur = filtered[activeIndex];
        if (cur) {
          onChange(cur.code);
          setOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIndex, onChange]);

  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[activeIndex] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full h-11 px-3 rounded-xl flex items-center justify-between gap-1.5 text-xs font-bold bg-neutral-500/5 dark:bg-zinc-800/30 text-foreground hover:bg-neutral-500/10 dark:hover:bg-zinc-800/50 transition-all outline-none cursor-pointer border-0 focus-visible:ring-2 focus-visible:ring-blue-500/30 select-none",
          triggerClassName,
        )}
      >
        <span>{value || "—"}</span>
        <ChevronDown size={12} className="text-neutral-400 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-[20vh] z-[200] w-full max-w-[360px] -translate-x-1/2 rounded-2xl border border-(--card-border) bg-(--card-solid) shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "60vh" }}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--card-border)">
                <Search size={14} className="text-(--text-muted) shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Cerca valuta…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  className="flex-1 bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-(--text-muted) font-medium"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-(--text-muted) hover:text-foreground transition-colors bg-transparent border-0 cursor-pointer p-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div
                ref={listRef}
                className="overflow-y-auto py-1.5 flex flex-col"
              >
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-xs text-(--text-muted) font-medium">
                    Nessuna valuta trovata.
                  </div>
                )}
                {filtered.map((cur, idx) => {
                  const isSelected = cur.code === value;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={cur.code}
                      type="button"
                      onClick={() => {
                        onChange(cur.code);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 text-left transition-colors border-0 cursor-pointer",
                        isActive
                          ? "bg-neutral-500/10 dark:bg-zinc-800/50"
                          : "bg-transparent",
                      )}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span
                          className={cn(
                            "text-xs font-black",
                            isSelected ? "text-blue-500" : "text-foreground",
                          )}
                        >
                          {cur.code}
                        </span>
                        <span className="text-[10px] text-(--text-muted) font-medium truncate">
                          {cur.name}
                        </span>
                      </div>
                      {isSelected && (
                        <Check
                          size={13}
                          className="text-blue-500 shrink-0 ml-3"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
