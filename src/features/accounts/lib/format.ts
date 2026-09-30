import type { AccountUser, Money, Withdrawal } from "../types/account.types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

/** Parses an API decimal string; anything unparsable counts as zero. */
export function parseMoney(value: Money | null | undefined): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

/** Integer paise, so comparisons and sums avoid floating-point drift. */
export function toPaise(value: number): number {
    return Math.round(value * 100);
}

export function fromPaise(paise: number): number {
    return paise / 100;
}

export function formatMoney(value: Money | number): string {
    return currencyFormatter.format(typeof value === "number" ? value : parseMoney(value));
}

/** `2026-06-10T00:00:00.000Z` → `2026-06-10`, without timezone shifting. */
export function toDateOnly(isoDate: string | null | undefined): string {
    return isoDate ? isoDate.slice(0, 10) : "";
}

export function formatDateOnly(isoDate: string | null | undefined): string {
    const [year, month, day] = toDateOnly(isoDate).split("-").map(Number);

    if (!year || !month || !day) {
        return "—";
    }

    return dateFormatter.format(new Date(year, month - 1, day));
}

/** Local-calendar `YYYY-MM-DD` for a Date (not UTC). */
export function toISODate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

export function todayISODate(): string {
    return toISODate(new Date());
}

/** Whole calendar days from a date-only value until today (never negative). */
export function daysSince(isoDate: string, today = new Date()): number {
    const [year, month, day] = toDateOnly(isoDate).split("-").map(Number);

    if (!year || !month || !day) {
        return 0;
    }

    const start = Date.UTC(year, month - 1, day);
    const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return Math.max(0, Math.round((now - start) / 86_400_000));
}

/** `10 Jun 2026 — ₹5,000.00`, used wherever a withdrawal is referenced. */
export function formatWithdrawalLabel(withdrawal: Withdrawal): string {
    return `${formatDateOnly(withdrawal.withdrawnOn)} — ${formatMoney(withdrawal.amount)}`;
}

export function userFullName(user: AccountUser | null): string {
    if (!user) {
        return "";
    }

    return `${user.firstName} ${user.lastName}`.trim();
}

export function userInitials(user: AccountUser | null): string {
    if (!user) {
        return "";
    }

    return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
}
