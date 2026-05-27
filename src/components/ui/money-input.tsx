"use client";

import type React from "react";
import { cn } from "@/lib/utils";

type MoneyInputProps = {
  value: string;
  onChange: (val: string) => void;
  currency?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
};

export function MoneyInput({
  value,
  onChange,
  currency = "EUR",
  placeholder = "0.00",
  required = false,
  className,
  inputClassName,
}: MoneyInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;

    rawVal = rawVal.replace(",", ".");
    rawVal = rawVal.replace(/[^0-9.]/g, "");

    const parts = rawVal.split(".");
    if (parts.length > 2) {
      rawVal = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    if (parts[1] && parts[1].length > 2) {
      rawVal = `${parts[0]}.${parts[1].substring(0, 2)}`;
    }

    onChange(rawVal);
  };

  const handleBlur = () => {
    if (!value) return;

    const num = parseFloat(value);
    if (!Number.isNaN(num)) {
      onChange(num.toFixed(2));
    }
  };

  return (
    <div
      className={cn(
        "bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-11 px-3 rounded-xl flex items-center w-full focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 transition-all duration-300 border border-[var(--card-border)]",
        className,
      )}
    >
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        required={required}
        className={cn(
          "text-xs text-[var(--foreground)] flex-1 bg-transparent border-0 outline-none w-full min-w-0",
          inputClassName,
        )}
      />
      <span className="flex items-center text-xs font-extrabold text-[var(--text-muted)] select-none ml-2 flex-shrink-0">
        {currency}
      </span>
    </div>
  );
}
