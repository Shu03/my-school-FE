import type { JSX } from "react";

import { PartyPopper } from "lucide-react";

import { daysFromToday, formatDateOnly } from "../lib/format";
import type { HolidayItem } from "../types/dashboard.types";

import { DateLeaf } from "./DateLeaf";
import { EmptyState, SectionCard } from "./SectionCard";
import { RelativeDayBadge } from "./StatusChip";

function countdown(iso: string, today: string): string | null {
    const diff = daysFromToday(iso, today);
    return diff !== null && diff > 1 ? `In ${diff} days` : null;
}

export function HolidayList({
    items,
    today,
    className,
}: {
    items: HolidayItem[];
    today: string;
    className?: string;
}): JSX.Element {
    return (
        <SectionCard
            icon={PartyPopper}
            title="Upcoming holidays"
            description="This academic year"
            className={className}
        >
            {items.length === 0 ? (
                <EmptyState icon={PartyPopper} message="No holidays coming up" />
            ) : (
                <ul className="divide-border/60 divide-y">
                    {items.map((item) => {
                        const inDays = countdown(item.date, today);
                        return (
                            <li
                                key={item.id}
                                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <DateLeaf iso={item.date} today={today} />
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                                    <p className="text-muted-foreground text-xs">
                                        {formatDateOnly(item.date)}
                                    </p>
                                </div>
                                {inDays ? (
                                    <span className="text-muted-foreground shrink-0 text-xs font-medium">
                                        {inDays}
                                    </span>
                                ) : (
                                    <RelativeDayBadge iso={item.date} today={today} />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </SectionCard>
    );
}
