import dayjs from "dayjs";
import "dayjs/locale/it";

dayjs.locale("it");

export type SortField = "date" | "description" | "category" | "type" | "amount";
export type ViewMode = "timeline" | "table" | "recurrent";
export type FilterType = "" | "expense" | "income";

export type RawTransaction = {
  id: string;
  userId: string;
  categoryId: string | null;
  description: string | null;
  type: string;
  amount: string;
  amountNok: string;
  amountEur: string;
  currency: string;
  date: Date;
  payerName: string | null;
  payerEmail: string | null;
  sharedInfo: {
    id: string;
    payerId: string;
    borrowerId: string;
    borrowerName: string;
    borrowerEmail: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
    isPaidByMe: boolean;
  } | null;
};

export type NormalizedTransaction = RawTransaction & {
  type: "expense" | "income";
};

export function normalizeTransaction(t: RawTransaction): NormalizedTransaction {
  return { ...t, type: t.type as "expense" | "income" };
}

export function groupByDate(
  txList: NormalizedTransaction[],
): { date: string; list: NormalizedTransaction[] }[] {
  const groups: Record<string, NormalizedTransaction[]> = {};
  for (const t of txList) {
    const key = dayjs(t.date).format("D MMMM YYYY");
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return Object.keys(groups).map((date) => ({ date, list: groups[date] }));
}

export function computeCategoryTotals(
  txList: NormalizedTransaction[],
  categories: { id: string; name: string; icon: string; color: string }[],
) {
  const sums: Record<
    string,
    {
      amountEur: number;
      count: number;
      color: string;
      icon: string;
      name: string;
    }
  > = {};

  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  for (const t of txList) {
    if (t.type !== "expense") continue;
    const catId = t.categoryId || "general";
    const cat = categoriesMap.get(t.categoryId || "");

    if (!sums[catId]) {
      sums[catId] = {
        amountEur: 0,
        count: 0,
        color: cat?.color ?? "#8E8E93",
        icon: cat?.icon ?? "Sparkles",
        name: cat?.name ?? "Generale",
      };
    }
    sums[catId].amountEur += parseFloat(t.amountEur);
    sums[catId].count += 1;
  }

  return Object.values(sums).sort((a, b) => b.amountEur - a.amountEur);
}
