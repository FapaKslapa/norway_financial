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
const commonFormatters: Record<string, Intl.NumberFormat> = {
  "EUR-false": new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  "NOK-false": new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  "USD-false": new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(
  currency: string,
  noDecimals: boolean,
): Intl.NumberFormat {
  const key = `${currency}-${noDecimals}`;
  let formatter = commonFormatters[key] || formatterCache.get(key);
  if (!formatter) {
    const NF = Intl["NumberFormat"];
    formatter = new NF(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export function formatCurrency(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  const noDecimals = ZERO_DECIMAL_CURRENCIES.has(code);
  try {
    return getFormatter(code, noDecimals).format(amount);
  } catch {
    return `${noDecimals ? Math.round(amount) : amount.toFixed(2)} ${code}`;
  }
}
