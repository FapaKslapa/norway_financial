"use client";

import { Card, CardContent, CardHeader } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/lib/utils";

type MonthTrend = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

type IncomeTrendCardProps = {
  trendData: MonthTrend[];
  displayCurrency: string;
};

export function IncomeTrendCard({
  trendData,
  displayCurrency,
}: IncomeTrendCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxVal = Math.max(...trendData.map((d) => d.income), 1000);

  const width = 500;
  const height = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = trendData.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / 5;
    const y = height - paddingBottom - (d.income / maxVal) * chartHeight;
    return { x, y, value: d.income, label: d.label };
  });

  const lineD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    "",
  );

  const areaD =
    points.length > 0
      ? `${lineD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : "";

  const findClosest = (clientX: number, rect: DOMRect): number | null => {
    const mouseX = ((clientX - rect.left) / rect.width) * width;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < points.length; i++) {
      const diff = Math.abs(points[i].x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return minDiff < 50 ? closestIdx : null;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const idx = findClosest(e.clientX, e.currentTarget.getBoundingClientRect());
    setHoveredIdx(idx);
    setTooltipPos(idx !== null ? { x: e.clientX, y: e.clientY } : null);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    const idx = findClosest(
      touch.clientX,
      e.currentTarget.getBoundingClientRect(),
    );
    setHoveredIdx(idx);
    setTooltipPos(idx !== null ? { x: touch.clientX, y: touch.clientY } : null);
  };

  const handleLeave = () => {
    setHoveredIdx(null);
    setTooltipPos(null);
  };

  return (
    <Card className="border border-(--card-border) bg-(--card-solid) shadow-xl p-6 rounded-[2rem] select-none w-full h-full flex flex-col">
      <CardHeader className="p-0 pb-4 border-b border-(--card-border) mb-6 flex flex-col items-start gap-1 shrink-0">
        <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <TrendingUp size={14} className="text-emerald-500" />
          Andamento Entrate
        </h4>
        <p className="text-[10px] text-(--text-muted)">
          Analisi delle entrate mensili negli ultimi 6 mesi
        </p>
      </CardHeader>

      <CardContent className="p-0 relative flex-1 min-h-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleLeave}
        >
          <title>Andamento Entrate</title>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.0" />
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
                  {val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                      ? `${(val / 1000).toFixed(0)}k`
                      : val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {areaD && (
            <path d={areaD} fill="url(#incomeGradient)" stroke="none" />
          )}
          {lineD && (
            <path
              d={lineD}
              fill="none"
              stroke="#34c759"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p, idx) => (
            <circle
              key={p.label}
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 5 : 3.5}
              fill="#34c759"
              stroke={
                hoveredIdx === idx
                  ? "rgba(52, 199, 89, 0.3)"
                  : "rgba(255,255,255,1)"
              }
              strokeWidth={hoveredIdx === idx ? 6 : 1.5}
              className="transition-all duration-150"
            />
          ))}

          {points.map((p) => (
            <text
              key={p.label}
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fontSize={9}
              fontWeight="bold"
              className="fill-neutral-500 dark:fill-zinc-400"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </CardContent>

      {mounted &&
        hoveredIdx !== null &&
        tooltipPos &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-2.5 py-1.5 rounded-xl text-[9px] font-bold shadow-lg flex flex-col gap-0.5"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, calc(-100% - 10px))",
            }}
          >
            <span className="opacity-60 uppercase text-[7px] tracking-wider font-extrabold">
              {points[hoveredIdx].label}
            </span>
            <span className="font-sans text-xs font-black">
              {formatCurrency(points[hoveredIdx].value, displayCurrency)}
            </span>
          </div>,
          document.body,
        )}
    </Card>
  );
}
