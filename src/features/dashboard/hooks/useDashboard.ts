import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { DASHBOARD_CONFIG } from "@constants/dashboard.constants";

import { ApiError } from "@lib/api/client";

import { useAuthStore } from "@features/auth";

import { getDashboard } from "../api/dashboard.api";
import type { DashboardResponse } from "../types/dashboard.types";

export const dashboardKeys = {
    all: ["dashboard"] as const,
    forUser: (userId: string) => [...dashboardKeys.all, userId] as const,
};

/** Only server (5xx) and network failures are worth one more attempt; 4xx never is. */
function shouldRetry(failureCount: number, error: Error): boolean {
    const isServerError = error instanceof ApiError && error.status >= 500;
    const isNetworkError = error instanceof TypeError;
    return (isServerError || isNetworkError) && failureCount < DASHBOARD_CONFIG.MAX_SERVER_RETRIES;
}

export function useDashboard(): UseQueryResult<DashboardResponse> {
    const userId = useAuthStore((s) => s.user?.id ?? "");

    return useQuery({
        queryKey: dashboardKeys.forUser(userId),
        queryFn: getDashboard,
        enabled: Boolean(userId),
        staleTime: DASHBOARD_CONFIG.STALE_TIME_MS,
        refetchOnWindowFocus: false,
        refetchInterval: false,
        retry: shouldRetry,
    });
}
