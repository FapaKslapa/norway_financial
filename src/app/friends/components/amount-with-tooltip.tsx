"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { cn, formatCurrency } from "@/lib/utils";

function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `${(amount / 1_000).toFixed(0)}k`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return amount.toFixed(2);
}

export function AmountWithTooltip({
  amount,
  currency,
  prefix,
  className,
}: {
  amount: number;
  currency: string;
  prefix: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const mounted = useIsMounted();

  useEffect(() => {
    if (!visible) return;
    const close = () => setVisible(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [visible]);

  const isRounded = amount >= 1000;
  const full = formatCurrency(amount, currency);

  if (!isRounded) {
    return (
      <span className={className}>
        {prefix}
        {full}
      </span>
    );
  }

  const compact = formatCompact(amount);

  return (
    <>
      <button
        type="button"
        className={cn(
          className,
          "underline decoration-dotted underline-offset-2 cursor-help bg-transparent border-0 p-0 font-[inherit]",
        )}
        onMouseEnter={(e) => {
          setPos({ x: e.clientX, y: e.clientY });
          setVisible(true);
        }}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setPos({ x: e.clientX, y: e.clientY });
          setVisible(true);
        }}
      >
        {prefix}≈{compact} {currency}
      </button>
      {mounted &&
        visible &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2.5 py-2 rounded-xl text-[9px] font-bold shadow-lg whitespace-nowrap flex flex-col gap-0.5"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
          >
            <span className="opacity-50 uppercase text-[7px] tracking-wider font-extrabold">
              Importo esatto
            </span>
            <span className="text-xs font-black">{full}</span>
          </div>,
          document.body,
        )}
    </>
  );
}
