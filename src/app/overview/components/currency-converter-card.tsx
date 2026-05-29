"use client";

import { Card, CardContent } from "@heroui/react";
import { ArrowRightLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-layout";
import { CurrencySelect } from "@/components/ui/currency-select";
import { formatCurrency } from "@/lib/utils";

const POPULAR_CURRENCIES = [
  "EUR",
  "USD",
  "GBP",
  "NOK",
  "SEK",
  "DKK",
  "CHF",
  "JPY",
  "CAD",
  "AUD",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "TRY",
  "BRL",
  "MXN",
  "SGD",
  "HKD",
  "KRW",
  "INR",
];

export function CurrencyConverterCard() {
  const { rates, displayCurrency, convertCurrency } = useDashboard();

  const defaultFrom = displayCurrency === "EUR" ? "USD" : "EUR";
  const defaultTo = displayCurrency;

  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [fromAmount, setFromAmount] = useState("100");
  const [toAmount, setToAmount] = useState("");

  useEffect(() => {
    const parsed = parseFloat(fromAmount);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const converted = convertCurrency(parsed, fromCurrency, toCurrency);
      setToAmount(converted.toFixed(2));
    }
  }, [fromCurrency, toCurrency, convertCurrency, fromAmount]);

  const handleFromChange = (val: string) => {
    setFromAmount(val);
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) {
      setToAmount(convertCurrency(parsed, fromCurrency, toCurrency).toFixed(2));
    } else {
      setToAmount("");
    }
  };

  const handleToChange = (val: string) => {
    setToAmount(val);
    const parsed = parseFloat(val);
    if (!Number.isNaN(parsed)) {
      setFromAmount(
        convertCurrency(parsed, toCurrency, fromCurrency).toFixed(2),
      );
    } else {
      setFromAmount("");
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const availableCurrencies = [
    ...new Set([
      ...POPULAR_CURRENCIES,
      ...Object.keys(rates).filter((c) => c.length === 3),
    ]),
  ].sort();

  const rate =
    rates[fromCurrency] && rates[toCurrency]
      ? (rates[toCurrency] / rates[fromCurrency]).toFixed(4)
      : "—";

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-6 apple-widget h-full flex flex-col justify-between transition-all">
      <div className="flex flex-row gap-2.5 items-start pb-4 border-b border-(--card-border) mb-4 select-none">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5">
          <ArrowRightLeft size={15} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs">Convertitore Valute</span>
          <span className="text-[8px] text-(--text-muted) font-extrabold uppercase tracking-wide mt-0.5">
            1 {fromCurrency} = {rate} {toCurrency}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSwap}
          className="ml-auto text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-400 bg-transparent border-0 cursor-pointer shrink-0"
        >
          Inverti
        </button>
      </div>

      <CardContent className="p-0 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
            Da
          </span>
          <div className="flex gap-2">
            <div className="flex-1 bg-neutral-500/5 dark:bg-zinc-800/30 h-9 px-2 rounded-xl flex items-center focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromChange(e.target.value)}
                className="text-xs text-foreground font-semibold flex-1 bg-transparent border-0 outline-none w-full"
              />
            </div>
            <div className="w-[90px]">
              <CurrencySelect
                value={fromCurrency}
                onChange={setFromCurrency}
                triggerClassName="h-9 text-xs"
                currencies={availableCurrencies.map((c) => ({
                  code: c,
                  name: c,
                }))}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-wider ml-1">
            A
          </span>
          <div className="flex gap-2">
            <div className="flex-1 bg-neutral-500/5 dark:bg-zinc-800/30 h-9 px-2 rounded-xl flex items-center focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
              <input
                type="number"
                value={toAmount}
                onChange={(e) => handleToChange(e.target.value)}
                className="text-xs text-foreground font-semibold flex-1 bg-transparent border-0 outline-none w-full"
              />
            </div>
            <div className="w-[90px]">
              <CurrencySelect
                value={toCurrency}
                onChange={setToCurrency}
                triggerClassName="h-9 text-xs"
                currencies={availableCurrencies.map((c) => ({
                  code: c,
                  name: c,
                }))}
              />
            </div>
          </div>
        </div>

        {fromAmount && toAmount && (
          <div className="text-center text-[9px] text-(--text-muted) font-semibold mt-1 select-none">
            {formatCurrency(parseFloat(fromAmount) || 0, fromCurrency)} ={" "}
            {formatCurrency(parseFloat(toAmount) || 0, toCurrency)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
