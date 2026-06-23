import type { JSX } from "react";

import {
    ArrowDownRight,
    ArrowUpRight,
    BookOpen,
    GraduationCap,
    Minus,
    TrendingUp,
    Users,
} from "lucide-react";

import { Stagger, StaggerItem } from "@components/common/Motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stat {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    /** Percentage change vs. last month. Positive = up, negative = down, 0 = flat. */
    trend: number;
    /** Relative data points (0–100) driving the sparkline shape. */
    series: number[];
}

const stats: Stat[] = [
    {
        label: "Total Students",
        value: "1,234",
        icon: GraduationCap,
        trend: 12,
        series: [40, 44, 42, 52, 58, 64, 72, 80],
    },
    {
        label: "Total Teachers",
        value: "56",
        icon: Users,
        trend: 3,
        series: [30, 34, 33, 38, 40, 42, 46, 48],
    },
    {
        label: "Active Classes",
        value: "42",
        icon: BookOpen,
        trend: 0,
        series: [50, 48, 52, 49, 51, 50, 50, 50],
    },
    {
        label: "Attendance Rate",
        value: "94%",
        icon: TrendingUp,
        trend: 2,
        series: [78, 80, 76, 82, 85, 88, 90, 94],
    },
];

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

export function DashboardPage(): JSX.Element {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StaggerItem key={stat.label}>
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
                                            <span className="text-muted-foreground text-xs">
                                                vs last month
                                            </span>
                                        </div>
                                    </div>
                                    <Sparkline
                                        series={stat.series}
                                        className={
                                            stat.trend < 0 ? "text-destructive" : "text-primary"
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </Stagger>
        </div>
    );
}
