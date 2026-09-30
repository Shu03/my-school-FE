import { useState } from "react";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FeeDatePickerProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

function parseDateValue(value: string): Date | undefined {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return undefined;
    }

    const [, yearValue, monthValue, dayValue] = match;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : undefined;
}

function toDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function FeeDatePicker({
    id,
    label,
    value,
    onChange,
    error,
}: FeeDatePickerProps): React.JSX.Element {
    const [open, setOpen] = useState(false);
    const selectedDate = parseDateValue(value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    aria-label={`Choose ${label.toLowerCase()}`}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="w-full justify-start text-left font-normal"
                >
                    <CalendarDays className="text-muted-foreground" />
                    {selectedDate ? (
                        selectedDate.toLocaleDateString(undefined, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })
                    ) : (
                        <span className="text-muted-foreground">Select a date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    onSelect={(date) => {
                        if (date) {
                            onChange(toDateValue(date));
                            setOpen(false);
                        }
                    }}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
