import type { JSX } from "react";

import { CalendarDays, PartyPopper } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { useHolidaysList } from "../hooks/useHolidays";
import { formatDate, toDateInputValue } from "../lib/format";

const UPCOMING_LIMIT = 5;

function todayInputValue(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function HolidaysWidget(): JSX.Element {
    const { data: holidays = [], isLoading } = useHolidaysList({});
    const today = todayInputValue();

    const todaysHoliday = holidays.find((holiday) => toDateInputValue(holiday.date) === today);
    const upcoming = holidays
        .filter((holiday) => toDateInputValue(holiday.date) > today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, UPCOMING_LIMIT);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Holidays</CardTitle>
                <span className="bg-primary/10 text-primary ring-primary/15 flex size-9 items-center justify-center rounded-xl ring-1">
                    <CalendarDays className="size-[1.15rem]" />
                </span>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && (
                    <div className="flex items-center gap-2 py-4">
                        <Spinner className="size-4" />
                        <span className="text-muted-foreground text-sm">Loading holidays...</span>
                    </div>
                )}

                {!isLoading && todaysHoliday && (
                    <div className="bg-success/12 text-success ring-success/20 flex items-center gap-2 rounded-lg px-3 py-2.5 ring-1">
                        <PartyPopper className="size-4 shrink-0" />
                        <span className="text-sm font-medium">
                            Today is a holiday: {todaysHoliday.name}
                        </span>
                    </div>
                )}

                {!isLoading && !todaysHoliday && (
                    <p className="text-muted-foreground text-sm">Today is a regular working day.</p>
                )}

                {!isLoading && (
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
                            Upcoming holidays
                        </p>
                        {upcoming.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No upcoming holidays.</p>
                        ) : (
                            <ul className="divide-border/60 divide-y">
                                {upcoming.map((holiday) => (
                                    <li
                                        key={holiday.id}
                                        className="flex items-center justify-between gap-3 py-2 text-sm"
                                    >
                                        <span className="font-medium">{holiday.name}</span>
                                        <span className="text-muted-foreground shrink-0">
                                            {formatDate(holiday.date)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
