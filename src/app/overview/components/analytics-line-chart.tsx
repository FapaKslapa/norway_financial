"use client";

import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatCurrency } from "@/lib/utils";

type MonthData = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

const WIDTH = 500;
const HEIGHT = 200;
const PADDING_LEFT = 50;
const PADDING_RIGHT = 20;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 30;

function generateLinePath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  return pts.reduce(
    (path, pt, i) =>
      i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`,
    "",
  );
}

function generateAreaPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  const linePath = generateLinePath(pts);
  const firstX = pts[0]?.x ?? PADDING_LEFT;
  const lastX = pts[pts.length - 1]?.x ?? WIDTH - PADDING_RIGHT;
  const baseY = HEIGHT - PADDING_BOTTOM;
  return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}

type AnalyticsLineChartProps = {
  months: MonthData[];
  maxVal: number;
  displayCurrency: string;
};

export function AnalyticsLineChart({
  months,
  maxVal,
  displayCurrency,
}: AnalyticsLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const mounted = useIsMounted();

  const width = WIDTH;
  const height = HEIGHT;
  const paddingLeft = PADDING_LEFT;
  const paddingRight = PADDING_RIGHT;
  const paddingTop = PADDING_TOP;
  const paddingBottom = PADDING_BOTTOM;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getCoordinates = (val: number, index: number) => {
    const x = paddingLeft + (index * chartWidth) / (months.length - 1);
    const y = height - paddingBottom - (val / maxVal) * chartHeight;
    return { x, y };
  };

  const incomePoints = months.map((m, i) => getCoordinates(m.income, i));
  const expensePoints = months.map((m, i) => getCoordinates(m.expense, i));

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
    <>
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
                  {formatCurrency(months[hoveredIndex].income, displayCurrency)}
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
    </>
  );
}
