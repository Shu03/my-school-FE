import type { DateRange } from "../types/account.types";

import { formatDateOnly, toISODate } from "./format";

export const DATE_RANGE_PRESETS = {
    THIS_MONTH: "this-month",
    LAST_MONTH: "last-month",
    LAST_30_DAYS: "last-30-days",
    FINANCIAL_YEAR: "financial-year",
    LAST_FINANCIAL_YEAR: "last-financial-year",
} as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[keyof typeof DATE_RANGE_PRESETS];

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
    [DATE_RANGE_PRESETS.THIS_MONTH]: "This month",
    [DATE_RANGE_PRESETS.LAST_MONTH]: "Last month",
    [DATE_RANGE_PRESETS.LAST_30_DAYS]: "Last 30 days",
    [DATE_RANGE_PRESETS.FINANCIAL_YEAR]: "This financial year",
    [DATE_RANGE_PRESETS.LAST_FINANCIAL_YEAR]: "Last financial year",
};

/** April is the first month of the Indian financial year. */
const FINANCIAL_YEAR_START_MONTH = 3;

const shortDateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

export function getPresetRange(preset: DateRangePreset, today = new Date()): Required<DateRange> {
    const year = today.getFullYear();
    const month = today.getMonth();
    const fyStartYear = month >= FINANCIAL_YEAR_START_MONTH ? year : year - 1;

    switch (preset) {
        case DATE_RANGE_PRESETS.THIS_MONTH:
            return {
                startDate: toISODate(new Date(year, month, 1)),
                endDate: toISODate(new Date(year, month + 1, 0)),
            };
        case DATE_RANGE_PRESETS.LAST_MONTH:
            return {
                startDate: toISODate(new Date(year, month - 1, 1)),
                endDate: toISODate(new Date(year, month, 0)),
            };
        case DATE_RANGE_PRESETS.LAST_30_DAYS:
            return {
                startDate: toISODate(new Date(year, month, today.getDate() - 29)),
                endDate: toISODate(today),
            };
        case DATE_RANGE_PRESETS.FINANCIAL_YEAR:
            return {
                startDate: toISODate(new Date(fyStartYear, FINANCIAL_YEAR_START_MONTH, 1)),
                endDate: toISODate(new Date(fyStartYear + 1, FINANCIAL_YEAR_START_MONTH, 0)),
            };
        case DATE_RANGE_PRESETS.LAST_FINANCIAL_YEAR:
            return {
                startDate: toISODate(new Date(fyStartYear - 1, FINANCIAL_YEAR_START_MONTH, 1)),
                endDate: toISODate(new Date(fyStartYear, FINANCIAL_YEAR_START_MONTH, 0)),
            };
    }
}

export function matchPreset(range: DateRange): DateRangePreset | null {
    const presets = Object.values(DATE_RANGE_PRESETS);
    return (
        presets.find((preset) => {
            const candidate = getPresetRange(preset);
            return candidate.startDate === range.startDate && candidate.endDate === range.endDate;
        }) ?? null
    );
}

function toLocalDate(isoDate: string): Date {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
}

/** Compact span like `1 Sep – 30 Sep 2026`, dropping the first year when both match. */
export function formatRangeSpan(range: DateRange): string {
    const { startDate, endDate } = range;

    if (startDate && endDate) {
        if (startDate.slice(0, 4) === endDate.slice(0, 4)) {
            return `${shortDateFormatter.format(toLocalDate(startDate))} – ${formatDateOnly(endDate)}`;
        }
        return `${formatDateOnly(startDate)} – ${formatDateOnly(endDate)}`;
    }

    if (startDate) {
        return `From ${formatDateOnly(startDate)}`;
    }

    if (endDate) {
        return `Until ${formatDateOnly(endDate)}`;
    }

    return "All dates";
}

/** Human label for the filter trigger: a preset name when one matches, else the span. */
export function describeRange(range: DateRange): string {
    const preset = matchPreset(range);
    return preset ? DATE_RANGE_PRESET_LABELS[preset] : formatRangeSpan(range);
}
