"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import dayjs from "dayjs";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/lib/utils";

type Transaction = {
  date: Date | string;
  type: string;
  amountEur: string;
  amountNok: string;
};

type OverviewAnalyticsCardProps = {
  transactions: Transaction[];
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
};

export function OverviewAnalyticsCard({
  transactions,
  displayCurrency,
  convertCurrency,
}: OverviewAnalyticsCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const months = Array.from({ length: 12 })
    .map((_, i) => dayjs().subtract(11 - i, "month"))
    .map((m) => {
      const monthStart = m.startOf("month");
      const monthEnd = m.endOf("month");

      const monthTx = transactions.filter((t) => {
        const d = dayjs(t.date);
        return d.isAfter(monthStart) && d.isBefore(monthEnd);
      });

      const incomeEur = monthTx
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amountEur), 0);

      const expenseEur = monthTx
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amountEur), 0);

      const income = convertCurrency(incomeEur, "EUR", displayCurrency);
      const expense = convertCurrency(expenseEur, "EUR", displayCurrency);
      const savings = income - expense;

      return {
        label: m.format("MMM"),
        income,
        expense,
        savings,
      };
    });

  const maxVal = Math.max(
    ...months.map((m) => Math.max(m.income, m.expense)),
    1000,
  );

  const width = 500;
  const height = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getCoordinates = (val: number, index: number) => {
    const x = paddingLeft + (index * chartWidth) / (months.length - 1);
    const y = height - paddingBottom - (val / maxVal) * chartHeight;
    return { x, y };
  };

  const incomePoints = months.map((m, i) => getCoordinates(m.income, i));
  const expensePoints = months.map((m, i) => getCoordinates(m.expense, i));

  const generateLinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    return pts.reduce(
      (path, pt, i) =>
        i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`,
      "",
    );
  };

  const generateAreaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    const linePath = generateLinePath(pts);
    const firstX = pts[0]?.x ?? paddingLeft;
    const lastX = pts[pts.length - 1]?.x ?? width - paddingRight;
    const baseY = height - paddingBottom;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const findClosest = (clientX: number, rect: DOMRect): number | null => {
    const mouseX = ((clientX - rect.left) / rect.width) * width;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < incomePoints.length; i++) {
      const diff = Math.abs(incomePoints[i].x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return minDiff < 30 ? closestIdx : null;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const idx = findClosest(e.clientX, e.currentTarget.getBoundingClientRect());
    setHoveredIndex(idx);
    setTooltipPos(idx !== null ? { x: e.clientX, y: e.clientY } : null);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    const idx = findClosest(
      touch.clientX,
      e.currentTarget.getBoundingClientRect(),
    );
    setHoveredIndex(idx);
    setTooltipPos(idx !== null ? { x: touch.clientX, y: touch.clientY } : null);
  };

  const handleLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  return (
    <Card className="border border-(--card-border) bg-(--card-solid) shadow-xl p-6 rounded-[2rem] select-none w-full h-full flex flex-col">
      <CardHeader className="p-0 pb-4 border-b border-(--card-border) mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <BarChart3 size={14} className="text-blue-500" />
            Analisi Trend
          </h4>
          <p className="text-[10px] text-(--text-muted)">
            Entrate e Spese degli ultimi 12 mesi
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#34c759] shadow-sm" />
            <span className="text-(--text-muted) font-mono">Entrate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff3b30] shadow-sm" />
            <span className="text-(--text-muted) font-mono">Spese</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleLeave}
        >
          <title>Trend Finanziario</title>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3b30" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ff3b30" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + ratio * chartHeight;
            const val = maxVal * (1 - ratio);
            return (
              <g key={ratio} className="opacity-40 dark:opacity-20">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                  className="text-neutral-300 dark:text-zinc-700"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={8}
                  fontWeight="bold"
                  className="fill-neutral-400 dark:fill-zinc-500 font-mono"
                >
                  {val >= 1000
                    ? val >= 1000000
                      ? `${(val / 1000000).toFixed(1)}M`
                      : `${(val / 1000).toFixed(0)}k`
                    : val.toFixed(0)}
                </text>
              </g>
            );
          })}

          <path
            d={generateAreaPath(incomePoints)}
            fill="url(#incomeGrad)"
            stroke="none"
          />
          <path
            d={generateAreaPath(expensePoints)}
            fill="url(#expenseGrad)"
            stroke="none"
          />

          <path
            d={generateLinePath(incomePoints)}
            fill="none"
            stroke="#34c759"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={generateLinePath(expensePoints)}
            fill="none"
            stroke="#ff3b30"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {incomePoints.map((p, idx) => (
            <g key={`inc-dot-${months[idx].label}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 3.5 : 2}
                fill="#34c759"
                stroke={
                  hoveredIndex === idx
                    ? "rgba(52, 199, 89, 0.3)"
                    : "rgba(255, 255, 255, 1)"
                }
                strokeWidth={hoveredIndex === idx ? 4 : 0.75}
                className="transition-all duration-150"
              />
            </g>
          ))}

          {expensePoints.map((p, idx) => (
            <g key={`exp-dot-${months[idx].label}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 3.5 : 2}
                fill="#ff3b30"
                stroke={
                  hoveredIndex === idx
                    ? "rgba(255, 59, 48, 0.3)"
                    : "rgba(255, 255, 255, 1)"
                }
                strokeWidth={hoveredIndex === idx ? 4 : 0.75}
                className="transition-all duration-150"
              />
            </g>
          ))}

          {months.map((m, index) => {
            const x = paddingLeft + (index * chartWidth) / (months.length - 1);
            const isMobileSkip = index % 2 !== 0;
            return (
              <text
                key={m.label}
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize={8}
                fontWeight="bold"
                className={`fill-neutral-500 dark:fill-zinc-400 font-sans uppercase tracking-wider ${
                  isMobileSkip ? "hidden sm:block" : ""
                }`}
              >
                {m.label}
              </text>
            );
          })}
        </svg>

        {mounted &&
          hoveredIndex !== null &&
          tooltipPos &&
          months[hoveredIndex] &&
          createPortal(
            <div
              className="fixed z-[9999] pointer-events-none bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3 py-2 rounded-2xl text-[9px] font-bold shadow-xl flex flex-col gap-1 min-w-[150px]"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: "translate(-50%, calc(-100% - 10px))",
              }}
            >
              <span className="opacity-80 uppercase text-[8px] tracking-wider font-extrabold text-neutral-400 dark:text-neutral-500">
                {dayjs()
                  .subtract(11 - hoveredIndex, "month")
                  .format("MMMM YYYY")}
              </span>
              <div className="flex flex-col gap-1 text-[10px] font-bold mt-1">
                <div className="flex justify-between items-center gap-4 text-emerald-500 dark:text-emerald-600">
                  <div className="flex items-center gap-1">
                    <ArrowDownLeft size={10} />
                    <span>Entrate</span>
                  </div>
                  <span>
                    {formatCurrency(
                      months[hoveredIndex].income,
                      displayCurrency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4 text-rose-500 dark:text-rose-600">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight size={10} />
                    <span>Spese</span>
                  </div>
                  <span>
                    {formatCurrency(
                      months[hoveredIndex].expense,
                      displayCurrency,
                    )}
                  </span>
                </div>
                <div className="border-t border-neutral-700 dark:border-neutral-200 pt-1 mt-1 flex justify-between items-center gap-4 text-white dark:text-neutral-900">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-blue-500" />
                    <span>Risparmio</span>
                  </div>
                  <span
                    className={
                      months[hoveredIndex].savings >= 0
                        ? "text-emerald-500 dark:text-emerald-600"
                        : "text-rose-500 dark:text-rose-600"
                    }
                  >
                    {formatCurrency(
                      months[hoveredIndex].savings,
                      displayCurrency,
                    )}
                  </span>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </CardContent>
    </Card>
  );
}
