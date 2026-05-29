"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/icon-helper";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type CategorySelectProps = {
  value: string;
  onChange: (val: string) => void;
  categories: CategoryOption[];
  generalLabel?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

export function CategorySelect({
  value,
  onChange,
  categories,
  generalLabel = "Generale",
  placeholder,
  className,
  triggerClassName,
}: CategorySelectProps) {
  const generalOption: CategoryOption = {
    id: "",
    name: generalLabel,
    icon: "Sparkles",
    color: "#8E8E93",
  };
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allOptions = [generalOption, ...categories];

  const filtered = query.trim()
    ? allOptions.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : allOptions;

  const selected = allOptions.find((c) => c.id === value) ?? generalOption;

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
        const opt = filtered[activeIndex];
        if (opt) {
          onChange(opt.id);
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
          "w-full h-11 px-3 rounded-xl flex items-center justify-between gap-2 text-xs font-bold bg-neutral-500/5 dark:bg-zinc-800/30 text-foreground hover:bg-neutral-500/10 dark:hover:bg-zinc-800/50 transition-all outline-none cursor-pointer border border-(--card-border) focus-visible:ring-2 focus-visible:ring-blue-500/30 select-none",
          triggerClassName,
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: selected.color }}
          >
            <CategoryIcon name={selected.icon} size={11} />
          </div>
          <span className="truncate">
            {selected.name || placeholder || generalLabel}
          </span>
        </div>
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
                <Search
                  size={14}
                  className="text-(--text-muted) shrink-0"
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Cerca categoria…"
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
                    Nessuna categoria trovata.
                  </div>
                )}
                {filtered.map((opt, idx) => {
                  const isSelected = opt.id === value;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={opt.id === "" ? "__general__" : opt.id}
                      type="button"
                      onClick={() => {
                        onChange(opt.id);
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
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: opt.color }}
                        >
                          <CategoryIcon name={opt.icon} size={12} />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-bold truncate",
                            isSelected
                              ? "text-blue-500"
                              : "text-foreground",
                          )}
                        >
                          {opt.name}
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
