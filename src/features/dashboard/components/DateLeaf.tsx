import type { JSX } from "react";

import { cn } from "@/lib/utils";

import { dateLeafParts, formatDateOnly, toDateKey } from "../lib/format";

/** Tear-off calendar tile for a date-only value; highlighted when it is the school's today. */
export function DateLeaf({ iso, today }: { iso: string; today: string }): JSX.Element {
    const parts = dateLeafParts(iso);
    const isToday = toDateKey(iso) === today;

    return (
        <time
            dateTime={toDateKey(iso)}
            title={formatDateOnly(iso)}
            className={cn(
                "flex w-12 shrink-0 flex-col overflow-hidden rounded-lg text-center shadow-xs ring-1",
                isToday ? "ring-primary/40" : "ring-border",
            )}
        >
            <span
                className={cn(
                    "py-0.5 text-[0.6rem] font-bold tracking-wider uppercase",
                    isToday ? "bg-primary text-primary-foreground" : "bg-primary/12 text-primary",
                )}
            >
                {parts?.month ?? "—"}
            </span>
            <span className="bg-card py-1 text-lg leading-none font-bold tabular-nums">
                {parts?.day ?? "—"}
            </span>
        </time>
    );
}
