"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { useState } from "react";
import { CategoryIcon } from "../../../components/icon-helper";
import { formatCurrency } from "../../../lib/utils";

type CategoryExpense = {
  id: string;
  amount: number;
  color: string;
  name: string;
  icon: string;
  percentage: number;
};

type CategoryBreakdownProps = {
  categoryExpenses: CategoryExpense[];
  totalExpense: number;
  displayCurrency: "NOK" | "EUR";
};

export function CategoryBreakdown({
  categoryExpenses,
  totalExpense,
  displayCurrency,
}: CategoryBreakdownProps) {
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<
    number | null
  >(null);

  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedPercentage = 0;

  return (
    <Card className="border border-[var(--card-border)] bg-[var(--card)] shadow-[var(--card-shadow)] p-6 apple-widget select-none w-full">
      <CardHeader className="p-0 pb-4 border-b border-[var(--card-border)] mb-6 flex flex-col items-start gap-1">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <PieChart size={14} className="text-blue-500" />
          Spese per Categoria
        </h4>
        <p className="text-[10px] text-[var(--text-muted)]">
          Ripartizione percentuale delle uscite mensili
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {categoryExpenses.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] gap-1">
            <span>Nessuna spesa registrata in questo mese.</span>
            <span className="text-[10px]">
              Aggiungi spese nella sezione transazioni.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-auto min-h-[224px]">
            <div className="relative flex justify-center items-center h-44 w-full">
              <svg
                width="140"
                height="140"
                viewBox="0 0 140 140"
                className="transform -rotate-90"
              >
                <title>Ripartizione Spese</title>
                {categoryExpenses.map((cat, idx) => {
                  const strokeLength =
                    (cat.percentage / 100) * donutCircumference;
                  const strokeOffset =
                    donutCircumference -
                    strokeLength +
                    (accumulatedPercentage / 100) * donutCircumference;
                  accumulatedPercentage += cat.percentage;

                  const isHovered = hoveredCategoryIndex === idx;

                  return (
                    <motion.circle
                      key={cat.id}
                      cx="70"
                      cy="70"
                      r={donutRadius}
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={isHovered ? 15 : 11}
                      strokeDasharray={`${strokeLength} ${donutCircumference}`}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap={cat.percentage > 2 ? "round" : "butt"}
                      animate={{
                        strokeWidth: isHovered ? 15 : 11,
                      }}
                      transition={{ duration: 0.2 }}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredCategoryIndex(idx)}
                      onMouseLeave={() => setHoveredCategoryIndex(null)}
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                  Speso
                </span>
                <span className="text-sm font-black tracking-tight">
                  {formatCurrency(totalExpense, displayCurrency)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {categoryExpenses.map((cat) => {
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-xl border border-transparent"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="h-6 w-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={12} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate text-[var(--foreground)]">
                          {cat.name}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)] font-medium font-sans">
                          {cat.percentage.toFixed(0)}% •{" "}
                          {formatCurrency(cat.amount, displayCurrency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
