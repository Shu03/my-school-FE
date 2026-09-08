import type { JSX } from "react";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { DashboardStat } from "../lib/mockStats";

/** Minimal dependency-free sparkline rendered from a 0–100 series. */
function Sparkline({ series, className }: { series: number[]; className?: string }): JSX.Element {
    const width = 72;
    const height = 28;
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    const step = width / (series.length - 1);
    const points = series
        .map((value, index) => {
            const x = index * step;
            const y = height - ((value - min) / span) * height;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            className={cn("overflow-visible", className)}
            aria-hidden="true"
        >
            <polyline
                points={points}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TrendChip({ trend }: { trend: number }): JSX.Element {
    const Icon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                trend > 0 && "bg-success/12 text-success",
                trend < 0 && "bg-destructive/10 text-destructive",
                trend === 0 && "bg-muted text-muted-foreground",
            )}
        >
            <Icon className="size-3" />
            {Math.abs(trend)}%
        </span>
    );
}

export function StatCard({ stat }: { stat: DashboardStat }): JSX.Element {
    return (
        <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                    {stat.label}
                </CardTitle>
                <span className="bg-primary/10 text-primary ring-primary/15 flex size-9 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105">
                    <stat.icon className="size-[1.15rem]" />
                </span>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <div className="text-2xl font-bold tracking-tight tabular-nums">
                            {stat.value}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <TrendChip trend={stat.trend} />
                            <span className="text-muted-foreground text-xs">vs last month</span>
                        </div>
                    </div>
                    <Sparkline
                        series={stat.series}
                        className={stat.trend < 0 ? "text-destructive" : "text-primary"}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
