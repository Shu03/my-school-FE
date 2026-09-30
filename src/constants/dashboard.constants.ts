import type { FeeStatus } from "./fees.constants";

/** Dashboard data-fetching and presentation settings. */
export const DASHBOARD_CONFIG = {
    /** Backend throttle is shared across endpoints, so keep the dashboard cached for a while. */
    STALE_TIME_MS: 60 * 1000,
    /** Retries allowed for 5xx / network failures (never for 4xx). */
    MAX_SERVER_RETRIES: 1,
    /** Days after today covered by the "upcoming" widgets. */
    UPCOMING_WINDOW_DAYS: 7,
    /** Max rows the backend returns per list. */
    LIST_LIMIT: 5,
    /** Lines of announcement content shown before "Read more". */
    ANNOUNCEMENT_CLAMP_LINES: 3,
} as const;

/** Percentage thresholds for attendance / result colouring. */
export const PERCENT_THRESHOLDS = {
    GOOD: 90,
    FAIR: 75,
} as const;

/** Dashboard-only fee status copy (the fees pages keep their shorter labels). */
export const DASHBOARD_FEE_STATUS_LABELS: Record<FeeStatus, string> = {
    PENDING: "Pending",
    PARTIAL: "Partially paid",
    PAID: "Paid",
};

export const ACCESS_REQUEST_STATUS_LABELS: Record<
    "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REVOKED",
    string
> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    REVOKED: "Revoked",
};

export const TEACHER_CLASS_ROLE_LABELS: Record<"CLASS_TEACHER" | "SUBJECT_TEACHER", string> = {
    CLASS_TEACHER: "Class Teacher",
    SUBJECT_TEACHER: "Subject Teacher",
};

/** Fallback copy for dashboard error / empty states. */
export const DASHBOARD_MESSAGES = {
    NO_ACADEMIC_YEAR_ADMIN: "No current academic year set. Please select an academic year.",
    NO_ACADEMIC_YEAR_MEMBER: "The school year hasn't been set up yet. Please check back later.",
    PROFILE_MISSING: "Your profile is not set up for this account.",
    CONTACT_ADMIN: "Contact the administrator",
    RATE_LIMITED: "Too many requests right now. Wait a moment, then try again.",
    GENERIC: "We couldn't load your dashboard. Check your connection and try again.",
} as const;

/** Locale + currency used for dates and money shown on the dashboard. */
export const DISPLAY_FORMAT = {
    LOCALE: "en-IN",
    CURRENCY: "INR",
    MAX_FRACTION_DIGITS: 2,
} as const;
