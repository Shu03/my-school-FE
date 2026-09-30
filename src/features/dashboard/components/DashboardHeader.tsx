import type { JSX } from "react";

import { CalendarRange, RefreshCw } from "lucide-react";

import { Role } from "@/types/api";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { formatLongDate } from "../lib/format";

const ROLE_SUBTITLE: Record<Role, string> = {
    [Role.ADMIN]: "Here's how the school is doing today.",
    [Role.TEACHER]: "Your teaching day at a glance.",
    [Role.STUDENT]: "Your day at school at a glance.",
};

interface DashboardHeaderProps {
    role: Role | undefined;
    yearName?: string;
    today?: string;
    isRefreshing: boolean;
    onRefresh?: () => void;
}

export function DashboardHeader({
    role,
    yearName,
    today,
    isRefreshing,
    onRefresh,
}: DashboardHeaderProps): JSX.Element {
    return (
        <header className="bg-card ring-foreground/10 texture-grain relative overflow-hidden rounded-xl shadow-sm ring-1">
            <div
                className="from-primary/20 via-primary/6 pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-radial to-transparent blur-2xl"
                aria-hidden="true"
            />
            <div className="border-border/60 from-primary/12 via-primary/5 relative flex flex-wrap items-center justify-between gap-4 border-b bg-linear-to-br to-transparent px-6 py-5">
                <div className="min-w-0">
                    {yearName ? (
                        <span className="bg-primary/12 text-primary ring-primary/25 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ring-1">
                            <CalendarRange className="size-3.5" aria-hidden="true" />
                            Academic year {yearName}
                        </span>
                    ) : (
                        <Skeleton className="h-5 w-40" />
                    )}
                    {today ? (
                        <h1 className="mt-2 text-2xl font-bold tracking-tight">
                            <time dateTime={today}>{formatLongDate(today)}</time>
                        </h1>
                    ) : (
                        <Skeleton className="mt-2 h-8 w-72 max-w-full" />
                    )}
                    {role ? (
                        <p className="text-muted-foreground mt-1 text-sm">{ROLE_SUBTITLE[role]}</p>
                    ) : null}
                </div>
                {onRefresh ? (
                    <Button
                        variant="outline"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        aria-busy={isRefreshing}
                    >
                        <RefreshCw
                            className={cn(
                                "size-4",
                                isRefreshing && "animate-spin motion-reduce:animate-none",
                            )}
                            aria-hidden="true"
                        />
                        {isRefreshing ? "Refreshing…" : "Refresh"}
                    </Button>
                ) : null}
            </div>
        </header>
    );
}
