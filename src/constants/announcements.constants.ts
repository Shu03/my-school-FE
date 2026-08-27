/** Field length limits for announcement forms (mirrors backend DTO). */
export const ANNOUNCEMENT_VALIDATION = {
    TITLE_MAX: 200,
    CONTENT_MAX: 5000,
} as const;

/** Pagination defaults for the announcements list. */
export const ANNOUNCEMENT_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;
