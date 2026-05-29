"use client";

import { DollarSign, Info, Sliders } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { MoneyInput } from "@/components/ui/money-input";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type BudgetTabProps = {
  targetBudget: string;
  setTargetBudget: (val: string) => void;
  maxBudget: string;
  setMaxBudget: (val: string) => void;
  displayCurrency: string;
  exchangeRate: number;
  categories: Category[];
  isCategoriesLoading: boolean;
  catBudgets: Record<string, string>;
  setCatBudgets: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export function BudgetTab({
  targetBudget,
  setTargetBudget,
  maxBudget,
  setMaxBudget,
  displayCurrency,
  exchangeRate,
  categories,
  isCategoriesLoading,
  catBudgets,
  setCatBudgets,
}: BudgetTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Global budget */}
      <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl shrink-0">
            <DollarSign size={14} />
          </div>
          <div>
            <p className="text-xs font-black">Budget Mensile Globale</p>
            <p className="text-[10px] text-(--text-muted)">
              Obiettivi di spesa in{" "}
              <span className="font-extrabold text-blue-500">
                {displayCurrency}
              </span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
              Budget Target (Obiettivo)
            </span>
            <MoneyInput
              value={targetBudget}
              onChange={setTargetBudget}
              currency={displayCurrency}
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-(--text-muted) font-black uppercase tracking-wider ml-1">
              Budget Massimo (Limite)
            </span>
            <MoneyInput
              value={maxBudget}
              onChange={setMaxBudget}
              currency={displayCurrency}
              className="h-11"
            />
          </div>
        </div>
        {displayCurrency === "EUR" && (
          <div className="flex items-start gap-2.5 text-[10px] text-(--text-muted) bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
            <Info size={13} className="shrink-0 mt-0.5 text-blue-500" />
            <span>
              I valori vengono convertiti in NOK al salvataggio al tasso
              corrente ({exchangeRate.toFixed(2)} NOK/EUR)
            </span>
          </div>
        )}
      </div>

      {/* Per-category budget */}
      <div className="bg-(--card-solid) border border-(--card-border) rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-(--card-border)">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0">
            <Sliders size={14} />
          </div>
          <div>
            <p className="text-xs font-black">Budget per Categoria</p>
            <p className="text-[10px] text-(--text-muted)">
              Limiti di spesa per ogni categoria
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isCategoriesLoading ? (
            <div className="text-xs text-(--text-muted) py-6 text-center font-bold col-span-2">
              Caricamento...
            </div>
          ) : categories && categories.length > 0 ? (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-3 bg-neutral-500/5 border border-(--card-border)/40 rounded-2xl p-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={14} />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="w-[110px] shrink-0">
                  <MoneyInput
                    value={catBudgets[cat.id] || "0.00"}
                    onChange={(newVal) =>
                      setCatBudgets((prev) => ({
                        ...prev,
                        [cat.id]: newVal,
                      }))
                    }
                    currency={displayCurrency}
                    className="h-9 text-[11px]"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-(--text-muted) py-6 text-center font-bold col-span-2">
              Nessuna categoria creata
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
