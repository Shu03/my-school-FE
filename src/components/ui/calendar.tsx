import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    DayPicker,
    type ChevronProps,
    type ClassNames,
    type DayPickerProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";

function CalendarChevron({ orientation = "right", className }: ChevronProps) {
    const Icon = orientation === "left" ? ChevronLeft : ChevronRight;

    return <Icon className={cn("size-4", className)} />;
}

const calendarClassNames: Partial<ClassNames> = {
    root: "w-fit",
    months: "flex flex-col gap-4",
    month: "space-y-4",
    month_caption: "relative flex h-8 items-center justify-center",
    caption_label: "text-sm font-semibold",
    nav: "absolute inset-x-0 top-0 flex items-center justify-between",
    button_previous:
        "border-border bg-background hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    button_next:
        "border-border bg-background hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    month_grid: "w-full border-collapse",
    weekdays: "flex",
    weekday: "text-muted-foreground flex size-9 items-center justify-center text-xs font-medium",
    week: "mt-1 flex w-full",
    day: "relative size-9 p-0 text-center text-sm",
    day_button:
        "hover:bg-muted inline-flex size-9 items-center justify-center rounded-md p-0 font-normal tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-selected:bg-primary aria-selected:text-primary-foreground",
    today: "[&>button]:border [&>button]:border-primary/40",
    outside: "text-muted-foreground/50",
    disabled: "text-muted-foreground/40",
    hidden: "invisible",
};

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: DayPickerProps): React.JSX.Element {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("text-foreground p-3", className)}
            classNames={{ ...calendarClassNames, ...classNames }}
            components={{ Chevron: CalendarChevron }}
            {...props}
        />
    );
}

export { Calendar };
