"use client";

import { Card, CardContent, InputGroup } from "@heroui/react";
import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";

type CurrencyConverterCardProps = {
  exchangeRate: number;
};

export function CurrencyConverterCard({
  exchangeRate,
}: CurrencyConverterCardProps) {
  const [eurAmount, setEurAmount] = useState("100");
  const [nokAmount, setNokAmount] = useState((100 * exchangeRate).toFixed(0));

  const handleEurChange = (val: string) => {
    setEurAmount(val);
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) {
      setNokAmount((parsed * exchangeRate).toFixed(0));
    } else {
      setNokAmount("");
    }
  };

  const handleNokChange = (val: string) => {
    setNokAmount(val);
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) {
      setEurAmount((parsed / exchangeRate).toFixed(2));
    } else {
      setEurAmount("");
    }
  };

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget h-full flex flex-col justify-between transition-all">
      <div className="p-0 flex flex-row gap-2.5 items-center pb-4 border-b border-[var(--card-border)] mb-4 w-full select-none">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
          <ArrowRightLeft size={15} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xs">Convertitore EUR/NOK</span>
          <span className="text-[8px] text-[var(--text-muted)] font-extrabold uppercase tracking-wide">
            Tasso: 1 EUR = {exchangeRate.toFixed(2)} NOK
          </span>
        </div>
      </div>

      <CardContent className="p-0 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
            Euro (EUR)
          </span>
          <InputGroup className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-9 px-2 rounded-xl flex items-center border-0 w-full focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 transition-all duration-300">
            <InputGroup.Input
              type="number"
              value={eurAmount}
              onChange={(e) => handleEurChange(e.target.value)}
              className="text-xs text-[var(--foreground)] font-semibold flex-1 bg-transparent border-0 outline-none w-full"
            />
            <InputGroup.Suffix className="flex items-center text-[10px] text-neutral-500 font-bold select-none">
              EUR
            </InputGroup.Suffix>
          </InputGroup>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider ml-1">
            Krone (NOK)
          </span>
          <InputGroup className="bg-neutral-500/5 dark:bg-zinc-800/30 focus-within:bg-neutral-500/10 dark:focus-within:bg-zinc-800/50 h-9 px-2 rounded-xl flex items-center border-0 w-full focus-within:ring-2 focus-within:ring-blue-500/30 dark:focus-within:ring-blue-500/20 transition-all duration-300">
            <InputGroup.Input
              type="number"
              value={nokAmount}
              onChange={(e) => handleNokChange(e.target.value)}
              className="text-xs text-[var(--foreground)] font-semibold flex-1 bg-transparent border-0 outline-none w-full"
            />
            <InputGroup.Suffix className="flex items-center text-[10px] text-neutral-500 font-bold select-none">
              NOK
            </InputGroup.Suffix>
          </InputGroup>
        </div>
      </CardContent>
    </Card>
  );
}
