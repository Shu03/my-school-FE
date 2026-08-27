import { SCHOOL_TIMEZONE } from "@constants/attendance.constants";

/** Today's date (YYYY-MM-DD) in the school timezone. */
export function schoolToday(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: SCHOOL_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

/** Current month (YYYY-MM) in the school timezone. */
export function schoolCurrentMonth(): string {
    return schoolToday().slice(0, 7);
}

export function formatDate(isoDate: string): string {
    const value = new Date(isoDate);

    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    return value.toLocaleDateString();
}
