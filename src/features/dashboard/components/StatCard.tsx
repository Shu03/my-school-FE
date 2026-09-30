import type { ComponentType, JSX, ReactNode } from "react";

import { Link } from "react-router-dom";

import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Tone } from "../lib/format";
import { TONE_FILL, TONE_TINT } from "../lib/tone";

interface StatCardProps {
    label: string;
    value: ReactNode;
    icon: ComponentType<{ className?: string }>;
    hint?: ReactNode;
    /** Draws attention (e.g. warning) — the hint text still carries the meaning. */
    tone?: Tone;
    to?: string;
}

/** KPI tile. When `to` is set the whole tile is a keyboard-reachable link. */
export function StatCard({
    label,
    value,
    icon: Icon,
    hint,
    tone = "primary",
    to,
}: StatCardProps): JSX.Element {
    const isAlert = tone === "warning" || tone === "destructive";

    const body = (
        <>
            <Icon
                className="text-foreground/4 pointer-events-none absolute -right-3 -bottom-4 size-24 transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none"
                aria-hidden="true"
            />
            <div className="flex items-start justify-between gap-3">
                <p className="text-muted-foreground text-sm font-medium">{label}</p>
                <span
                    className={cn(
                        "texture-sheen relative flex size-9 shrink-0 items-center justify-center rounded-xl ring-1",
                        TONE_TINT[tone],
                    )}
                >
                    <Icon className="size-[1.1rem]" aria-hidden="true" />
                    {isAlert ? (
                        <span
                            className="absolute -top-0.5 -right-0.5 flex size-2.5"
                            aria-hidden="true"
                        >
                            <span
                                className={cn(
                                    "absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none",
                                    TONE_FILL[tone],
                                )}
                            />
                            <span
                                className={cn(
                                    "relative inline-flex size-2.5 rounded-full",
                                    TONE_FILL[tone],
                                )}
                            />
                        </span>
                    ) : null}
                </span>
            </div>
            <div className="relative mt-3 text-3xl font-bold tracking-tight tabular-nums">
                {value}
            </div>
            {hint ? (
                <div className="text-muted-foreground relative mt-1 text-xs">{hint}</div>
            ) : null}
            {to ? (
                <ArrowUpRight
                    className="text-muted-foreground absolute right-4 bottom-4 size-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                />
            ) : null}
        </>
    );

    const shell = cn(
        "group bg-card text-card-foreground texture-grain relative block h-full overflow-hidden rounded-xl p-5 shadow-sm ring-1 transition-all duration-200 motion-reduce:transition-none",
        isAlert
            ? tone === "destructive"
                ? "ring-destructive/40"
                : "ring-warning/40"
            : "ring-foreground/10",
        to &&
            "hover:ring-foreground/20 focus-visible:ring-ring/60 outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 motion-reduce:hover:translate-y-0",
    );

    return to ? (
        <Link to={to} className={shell}>
            {body}
        </Link>
    ) : (
        <div className={shell}>{body}</div>
    );
}
