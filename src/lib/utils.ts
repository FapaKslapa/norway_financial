import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "ISK",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function convertAmounts(
  amount: number,
  currency: string,
  exchangeRate: number,
  exchangeRateNok = 11.85,
): { amountEur: number; amountNok: number } {
  const amountEur = currency === "EUR" ? amount : amount / exchangeRate;
  const amountNok = amountEur * exchangeRateNok;
  return { amountEur, amountNok };
}

export function formatCurrency(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  const noDecimals = ZERO_DECIMAL_CURRENCIES.has(code);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    }).format(amount);
  } catch {
    return `${noDecimals ? Math.round(amount) : amount.toFixed(2)} ${code}`;
  }
}
