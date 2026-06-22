/**
 * Authentication-related constants: events, token timing, and password policy.
 */

/** Custom DOM events dispatched by the auth layer. */
export const AUTH_EVENTS = {
    SESSION_EXPIRED: "auth:session-expired",
} as const;

/** How long before access-token expiry to proactively refresh (90 seconds). */
export const TOKEN_REFRESH_LEAD_MS = 1.5 * 60 * 1000;

/** Validation pattern for a 10-digit mobile number. */
export const MOBILE_NUMBER_PATTERN = /^\d{10}$/;

/** Password policy rules, patterns, and user-facing messages. */
export const PASSWORD_POLICY = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 72,
    PATTERNS: {
        UPPERCASE: /[A-Z]/,
        LOWERCASE: /[a-z]/,
        DIGIT: /[0-9]/,
        SPECIAL: /[!@#$%^&*]/,
    },
    MESSAGES: {
        LENGTH: "Password must be 8-72 characters",
        UPPERCASE: "Password must contain at least one uppercase letter (A-Z)",
        LOWERCASE: "Password must contain at least one lowercase letter (a-z)",
        DIGIT: "Password must contain at least one digit (0-9)",
        SPECIAL: "Password must contain at least one special character (!@#$%^&*)",
    },
} as const;
