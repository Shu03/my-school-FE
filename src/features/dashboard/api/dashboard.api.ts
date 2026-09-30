import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type { DashboardResponse } from "../types/dashboard.types";

export async function getDashboard(): Promise<DashboardResponse> {
    return apiFetch<DashboardResponse>(API_ENDPOINTS.DASHBOARD, { method: "GET" });
}
