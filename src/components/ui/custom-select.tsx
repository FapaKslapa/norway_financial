"use client";

import { AnimatePresence, m } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
};

type CustomSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  footerAction?: {
    label: string;
    onPress: () => void;
  };
};

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleziona opzione...",
  className,
  triggerClassName,
  dropdownClassName,
  footerAction,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const handleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 260);
    }
    setIsOpen((v) => !v);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", isOpen ? "z-[60]" : "z-10", className)}
    >
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "w-full h-11 px-3 rounded-xl flex items-center justify-between text-xs bg-neutral-500/5 dark:bg-zinc-800/30 text-foreground hover:bg-neutral-500/10 dark:hover:bg-zinc-800/50 transition-all outline-none text-left cursor-pointer border-0 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/20",
          triggerClassName,
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedOption.color }}
                />
              )}
              {selectedOption.icon}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-neutral-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-neutral-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: openUpward ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: openUpward ? -4 : 4, scale: 1 }}
            exit={{ opacity: 0, y: openUpward ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute left-0 right-0 z-[100] rounded-2xl border border-(--card-border) shadow-xl max-h-60 overflow-hidden flex flex-col",
              openUpward ? "bottom-full mb-1" : "top-full mt-1",
              dropdownClassName,
            )}
            style={{ backgroundColor: "var(--card-solid)" }}
          >
            <div className="overflow-y-auto py-1.5 flex-1 max-h-48">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-neutral-500/10 text-left transition-colors text-foreground cursor-pointer",
                      isSelected && "font-bold bg-neutral-500/5",
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.color && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      {opt.icon}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check
                        size={14}
                        className="text-blue-500 shrink-0 ml-2"
                      />
                    )}
                  </button>
                );
              })}

              {options.length === 0 && (
                <div className="px-3 py-3 text-center text-xs text-neutral-500 font-medium">
                  Nessuna opzione disponibile.
                </div>
              )}
            </div>

            {footerAction && (
              <button
                type="button"
                onClick={() => {
                  footerAction.onPress();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2.5 text-center text-[10px] font-extrabold text-blue-500 border-t border-(--card-border) hover:bg-blue-500/5 transition-colors uppercase tracking-wider block cursor-pointer"
              >
                {footerAction.label}
              </button>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
