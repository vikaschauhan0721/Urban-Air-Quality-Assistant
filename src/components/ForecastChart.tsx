"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import type { AqiScale, CleanestWindow, HourlyForecastPoint } from "@/lib/types";
import { Badge, Card } from "./ui/primitives";

export function ForecastChart({
  hourly,
  cleanestWindow,
  scale,
  title,
  subtitle,
}: {
  hourly: HourlyForecastPoint[];
  cleanestWindow: CleanestWindow;
  scale: AqiScale;
  title: string;
  subtitle: string;
}) {
  const data = hourly.slice(0, 24).map((pt) => ({
    hour: pt.hourLabel,
    aqi: scale === "cpcb" ? pt.cpcbAqi : pt.usAqi,
    pm25: pt.pm2_5,
  }));

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
        </div>
        <Badge tone="success">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {cleanestWindow.startLabel}–{cleanestWindow.endLabel}
          </span>
        </Badge>
      </div>

      <div className="h-56 w-full" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--aqi-accent)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--aqi-accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceArea
              x1={cleanestWindow.startLabel}
              x2={cleanestWindow.endLabel}
              fill="#10b981"
              fillOpacity={0.18}
              strokeOpacity={0}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-strong)",
                borderRadius: "14px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                name === "aqi" ? `${value} AQI` : `${value} µg/m³`,
                name === "aqi" ? (scale === "cpcb" ? "CPCB AQI" : "US AQI") : "PM2.5",
              ]}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="var(--aqi-accent)"
              strokeWidth={2.5}
              fill="url(#aqiGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
