"use client";

import { Button, Card, CardContent } from "@heroui/react";
import { m } from "framer-motion";
import { AlertTriangle, FolderHeart, Sliders } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { formatCurrency } from "@/lib/utils";

type CategoryBudgetInfo = {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  createdAt: Date;
  updatedAt: Date;
};

type CategoryInfo = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type TransactionInfo = {
  id: string;
  type: string;
  categoryId: string | null;
  amountNok: string;
};

type CategoryBudgetsCardProps = {
  transactions: TransactionInfo[];
  categories: CategoryInfo[];
  categoryBudgets: CategoryBudgetInfo[];
  displayCurrency: string;
  convertCurrency: (val: number, from: string, to: string) => number;
  onOpenSettings: () => void;
};

export function CategoryBudgetsCard({
  transactions,
  categories,
  categoryBudgets,
  displayCurrency,
  convertCurrency,
  onOpenSettings,
}: CategoryBudgetsCardProps) {
  const activeBudgets = categoryBudgets.filter((b) => parseFloat(b.amount) > 0);

  const budgetItems = activeBudgets.map((budget) => {
    const category = categories.find((c) => c.id === budget.categoryId);
    const categoryName = category?.name || "Sconosciuta";
    const categoryIcon = category?.icon || "📂";
    const categoryColor = category?.color || "#3b82f6";

    const spentInNok = transactions
      .filter((t) => t.type === "expense" && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + parseFloat(t.amountNok), 0);

    const budgetVal = convertCurrency(
      parseFloat(budget.amount),
      "NOK",
      displayCurrency,
    );
    const spentVal = convertCurrency(spentInNok, "NOK", displayCurrency);

    const percentage = budgetVal > 0 ? (spentVal / budgetVal) * 100 : 0;
    const progressPercent = Math.min(percentage, 100);

    const isOver = spentVal > budgetVal;
    const isWarning = spentVal >= budgetVal * 0.8 && spentVal <= budgetVal;

    let barColor = "bg-blue-500";
    let textColor = "text-blue-500";
    if (isOver) {
      barColor = "bg-red-500";
      textColor = "text-red-500";
    } else if (isWarning) {
      barColor = "bg-amber-500";
      textColor = "text-amber-500";
    } else {
      barColor = "bg-emerald-500";
      textColor = "text-emerald-500";
    }

    return {
      id: budget.id,
      categoryName,
      categoryIcon,
      categoryColor,
      budgetVal,
      spentVal,
      percentage,
      progressPercent,
      barColor,
      textColor,
    };
  });

  return (
    <Card className="border border-(--card-border) bg-(--card) shadow-(--card-shadow) p-6 apple-widget h-full flex flex-col justify-between transition-all select-none relative overflow-hidden">
      <div className="p-0 flex flex-row justify-between items-center pb-4 border-b border-(--card-border) mb-4 w-full">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
            <FolderHeart size={15} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs">Budget Categorie</span>
            <span className="text-[9px] text-(--text-muted)">
              Limiti mensili per categoria
            </span>
          </div>
        </div>
        <Button
          isIconOnly
          variant="ghost"
          className="text-(--text-muted) border border-(--card-border) hover:bg-neutral-500/10 rounded-xl h-7 w-7 min-w-7 cursor-pointer flex items-center justify-center"
          onPress={onOpenSettings}
        >
          <Sliders size={12} />
        </Button>
      </div>

      {budgetItems.length === 0 ? (
        <CardContent className="p-0 flex flex-col items-center justify-center text-center gap-4 py-4 flex-1">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div className="flex flex-col gap-1 px-2">
            <span className="font-extrabold text-sm text-foreground">
              Nessun budget di categoria
            </span>
            <span className="text-[10px] text-(--text-muted) max-w-[200px] leading-normal mx-auto font-medium">
              Imposta limiti di budget per singole categorie per monitorare al
              meglio le tue abitudini.
            </span>
          </div>
          <Button
            onPress={onOpenSettings}
            className="bg-foreground text-background hover:opacity-90 text-[10px] font-extrabold rounded-xl h-8 px-4 border-0 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sliders size={11} />
            Imposta limiti
          </Button>
        </CardContent>
      ) : (
        <CardContent className="p-0 flex flex-col gap-4 overflow-y-auto max-h-[220px] pr-1 scrollbar-none flex-1">
          {budgetItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: item.categoryColor || "#3b82f6" }}
                  >
                    <CategoryIcon
                      name={item.categoryIcon || "Sparkles"}
                      size={11}
                    />
                  </div>
                  <span className="text-[11px] font-bold">
                    {item.categoryName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-(--text-muted)">
                    {formatCurrency(item.spentVal, displayCurrency)} di
                  </span>
                  <span className="text-[10px] font-bold">
                    {formatCurrency(item.budgetVal, displayCurrency)}
                  </span>
                </div>
              </div>
              <div className="relative w-full h-2 bg-neutral-100 dark:bg-zinc-800/40 rounded-full overflow-hidden border border-(--card-border)/20">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${item.barColor}`}
                />
              </div>
              <div className="flex justify-between items-center text-[9px] text-(--text-muted)">
                <span>{item.percentage.toFixed(0)}% del budget</span>
                {item.percentage >= 100 && (
                  <span className="text-red-500 font-bold">
                    Limite superato
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
