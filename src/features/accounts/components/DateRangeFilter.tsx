import { useState } from "react";
import type { JSX } from "react";

import { CalendarRange, Check, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
    DATE_RANGE_PRESET_LABELS,
    DATE_RANGE_PRESETS,
    describeRange,
    formatRangeSpan,
    getPresetRange,
    matchPreset,
    type DateRangePreset,
} from "../lib/dateRange";
import type { DateRange } from "../types/account.types";

interface DateRangeFilterProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps): JSX.Element {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRange>(value);

    const hasRange = Boolean(value.startDate || value.endDate);
    const activePreset = matchPreset(value);
    const draftChanged =
        (draft.startDate ?? "") !== (value.startDate ?? "") ||
        (draft.endDate ?? "") !== (value.endDate ?? "");

    function handleOpenChange(next: boolean): void {
        if (next) {
            setDraft(value);
        }
        setOpen(next);
    }

    function apply(range: DateRange): void {
        onChange(range);
        setOpen(false);
    }

    function updateDraft(field: keyof DateRange, raw: string): void {
        const next = { ...draft, [field]: raw || undefined };
        // Keep the range ordered even if someone picks the ends back to front.
        if (next.startDate && next.endDate && next.startDate > next.endDate) {
            if (field === "startDate") {
                next.endDate = next.startDate;
            } else {
                next.startDate = next.endDate;
            }
        }
        setDraft(next);
    }

    return (
        <div className="inline-flex items-stretch">
            <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "focus-visible:ring-ring/50 inline-flex h-9 items-center gap-2 border px-3 text-sm transition-colors outline-none focus-visible:ring-3",
                            hasRange
                                ? "border-primary/35 bg-primary/[0.06] rounded-l-lg border-r-0"
                                : "border-input hover:bg-muted/60 rounded-lg",
                        )}
                    >
                        <CalendarRange
                            className={cn(
                                "size-4",
                                hasRange ? "text-primary" : "text-muted-foreground",
                            )}
                            aria-hidden="true"
                        />
                        <span className="text-muted-foreground hidden sm:inline">Dates</span>
                        <span className="font-semibold whitespace-nowrap tabular-nums">
                            {describeRange(value)}
                        </span>
                        <ChevronDown
                            className="text-muted-foreground size-3.5"
                            aria-hidden="true"
                        />
                    </button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-[min(36rem,calc(100vw-2rem))] p-0">
                    <div className="grid sm:grid-cols-[15rem_1fr]">
                        <div className="border-border/60 flex flex-col border-b p-2 sm:border-r sm:border-b-0">
                            <p className="text-muted-foreground px-2 pt-1.5 pb-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                                Quick ranges
                            </p>
                            <PresetOption
                                label="All dates"
                                hint="Everything recorded"
                                isActive={!hasRange}
                                onSelect={() => apply({})}
                            />
                            {Object.values(DATE_RANGE_PRESETS).map((preset: DateRangePreset) => (
                                <PresetOption
                                    key={preset}
                                    label={DATE_RANGE_PRESET_LABELS[preset]}
                                    hint={formatRangeSpan(getPresetRange(preset))}
                                    isActive={activePreset === preset}
                                    onSelect={() => apply(getPresetRange(preset))}
                                />
                            ))}
                        </div>

                        <form
                            className="flex flex-col gap-3 p-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                apply(draft);
                            }}
                        >
                            <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                                Custom range
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="ledger-from">From</Label>
                                <Input
                                    id="ledger-from"
                                    type="date"
                                    className="h-9"
                                    value={draft.startDate ?? ""}
                                    onChange={(event) =>
                                        updateDraft("startDate", event.target.value)
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="ledger-to">To</Label>
                                <Input
                                    id="ledger-to"
                                    type="date"
                                    className="h-9"
                                    value={draft.endDate ?? ""}
                                    onChange={(event) => updateDraft("endDate", event.target.value)}
                                />
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Both days are included. Leave one empty for an open-ended range.
                            </p>
                            <div className="mt-auto flex justify-end gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={!draftChanged}>
                                    Apply range
                                </Button>
                            </div>
                        </form>
                    </div>
                </PopoverContent>
            </Popover>

            {hasRange && (
                <button
                    type="button"
                    aria-label="Clear date range"
                    title="Show all dates"
                    className="border-primary/35 bg-primary/[0.06] text-muted-foreground hover:text-foreground hover:bg-primary/10 focus-visible:ring-ring/50 inline-flex w-8 items-center justify-center rounded-r-lg border border-l-0 transition-colors outline-none focus-visible:ring-3"
                    onClick={() => onChange({})}
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}

function PresetOption({
    label,
    hint,
    isActive,
    onSelect,
}: {
    label: string;
    hint: string;
    isActive: boolean;
    onSelect: () => void;
}): JSX.Element {
    return (
        <button
            type="button"
            aria-pressed={isActive}
            onClick={onSelect}
            className={cn(
                "focus-visible:ring-ring/50 flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors outline-none focus-visible:ring-3",
                isActive ? "bg-primary/10" : "hover:bg-muted",
            )}
        >
            <span className="min-w-0 flex-1">
                <span
                    className={cn(
                        "block text-sm",
                        isActive ? "text-primary font-semibold" : "font-medium",
                    )}
                >
                    {label}
                </span>
                <span className="text-muted-foreground block truncate text-xs tabular-nums">
                    {hint}
                </span>
            </span>
            {isActive && <Check className="text-primary size-4 shrink-0" aria-hidden="true" />}
        </button>
    );
}
