import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: "EUR" | "NOK") {
  return currency === "EUR"
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format(amount)
    : new Intl.NumberFormat("no-NO", {
        style: "currency",
        currency: "NOK",
        minimumFractionDigits: 0,
      }).format(amount);
}
