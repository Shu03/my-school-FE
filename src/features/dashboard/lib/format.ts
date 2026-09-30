import { DISPLAY_FORMAT, PERCENT_THRESHOLDS } from "@constants/dashboard.constants";

const MS_PER_DAY = 86_400_000;

const moneyFormatter = new Intl.NumberFormat(DISPLAY_FORMAT.LOCALE, {
    style: "currency",
    currency: DISPLAY_FORMAT.CURRENCY,
    maximumFractionDigits: DISPLAY_FORMAT.MAX_FRACTION_DIGITS,
});

const dateOnlyFormatter = new Intl.DateTimeFormat(DISPLAY_FORMAT.LOCALE, {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
});

const longDateFormatter = new Intl.DateTimeFormat(DISPLAY_FORMAT.LOCALE, {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

const dayNumberFormatter = new Intl.DateTimeFormat(DISPLAY_FORMAT.LOCALE, {
    timeZone: "UTC",
    day: "numeric",
});

const monthShortFormatter = new Intl.DateTimeFormat(DISPLAY_FORMAT.LOCALE, {
    timeZone: "UTC",
    month: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat(DISPLAY_FORMAT.LOCALE, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
});

/** "2026-10-02T00:00:00.000Z" or "2026-10-02" → "2026-10-02". */
export function toDateKey(iso: string): string {
    return iso.slice(0, 10);
}

/** Parses a `YYYY-MM-DD` key as UTC midnight; null when unparsable. */
function parseDateKey(key: string): Date | null {
    const [year, month, day] = key.split("-").map(Number);
    if (!year || !month || !day) {
        return null;
    }
    return new Date(Date.UTC(year, month - 1, day));
}

/** Date-only values are UTC midnight, so format in UTC to avoid shifting the day. */
export function formatDateOnly(iso: string): string {
    const date = parseDateKey(toDateKey(iso));
    return date ? dateOnlyFormatter.format(date) : "—";
}

/** Calendar-leaf parts for a date-only value, e.g. { day: "2", month: "Oct" }. */
export function dateLeafParts(iso: string): { day: string; month: string } | null {
    const date = parseDateKey(toDateKey(iso));
    return date
        ? { day: dayNumberFormatter.format(date), month: monthShortFormatter.format(date) }
        : null;
}

/** Long header date for the school's "today" key. */
export function formatLongDate(dateKey: string): string {
    const date = parseDateKey(dateKey);
    return date ? longDateFormatter.format(date) : "—";
}

/** Real timestamps are shown in the viewer's local time. */
export function formatDateTime(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

/** Whole days from `today` to the date-only value (negative = past). */
export function daysFromToday(iso: string, today: string): number | null {
    const target = parseDateKey(toDateKey(iso));
    const base = parseDateKey(today);
    if (!target || !base) {
        return null;
    }
    return Math.round((target.getTime() - base.getTime()) / MS_PER_DAY);
}

export type RelativeDay = "Today" | "Tomorrow";

export function relativeDayLabel(iso: string, today: string): RelativeDay | null {
    const diff = daysFromToday(iso, today);
    if (diff === 0) {
        return "Today";
    }
    if (diff === 1) {
        return "Tomorrow";
    }
    return null;
}

/** Account values arrive as decimal strings; convert for display only. */
export function formatMoney(value: number | string): string {
    const amount = typeof value === "number" ? value : Number(value);
    return moneyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

/** Integer share of `part` in `whole`, guarding against division by zero. */
export function percentOf(part: number, whole: number): number {
    if (whole <= 0) {
        return 0;
    }
    return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
}

export type Tone = "success" | "warning" | "destructive" | "info" | "primary" | "muted";

export function percentTone(percentage: number): Tone {
    if (percentage >= PERCENT_THRESHOLDS.GOOD) {
        return "success";
    }
    if (percentage >= PERCENT_THRESHOLDS.FAIR) {
        return "warning";
    }
    return "destructive";
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
    return `${count} ${count === 1 ? singular : plural}`;
}
