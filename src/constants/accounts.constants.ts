/** Field limits for account forms (mirrors backend DTOs). */
export const ACCOUNT_VALIDATION = {
    AMOUNT_MIN: 0.01,
    AMOUNT_MAX: 9999999999.99,
    NOTE_MAX: 500,
    WITHDRAWN_BY_MAX: 200,
    VENDOR_MAX: 200,
    CATEGORY_MAX: 100,
    BILL_NUMBER_MAX: 100,
} as const;

/** Pagination defaults for account ledgers. */
export const ACCOUNT_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const ACCOUNT_TABS = {
    DEPOSITS: "deposits",
    WITHDRAWALS: "withdrawals",
    BILLS: "bills",
} as const;

export type AccountTab = (typeof ACCOUNT_TABS)[keyof typeof ACCOUNT_TABS];

/** Search-param keys used by the accounts page for deep links. */
export const ACCOUNT_SEARCH_PARAMS = {
    TAB: "tab",
    WITHDRAWAL_ID: "withdrawalId",
} as const;

/** The API rejects malformed ids with 400, so deep-link ids are checked first. */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cash still unbilled after this many days is flagged for follow-up. */
export const CASH_STALE_AFTER_DAYS = 14;

/** How many open withdrawals the "awaiting bills" section shows before linking to the ledger. */
export const OPEN_CASH_PREVIEW_LIMIT = 6;

export const BILL_CATEGORY_SUGGESTIONS = [
    "Petrol",
    "Food",
    "Stationery",
    "Maintenance",
    "Other",
] as const;
