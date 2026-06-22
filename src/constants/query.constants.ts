/**
 * Default configuration for the TanStack Query client.
 */
export const QUERY_CONFIG = {
    STALE_TIME_MS: 5 * 60 * 1000, // 5 minutes
    RETRY_COUNT: 1,
    REFETCH_ON_WINDOW_FOCUS: false,
} as const;
