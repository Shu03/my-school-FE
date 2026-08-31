import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type { CreateHolidayRequest, Holiday, HolidaysListParams } from "../types/holiday.types";

export async function listHolidays(params?: HolidaysListParams): Promise<Holiday[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.SCHOOL.HOLIDAYS}?${queryString}`
        : API_ENDPOINTS.SCHOOL.HOLIDAYS;

    return apiFetch<Holiday[]>(endpoint, {
        method: "GET",
    });
}

export async function createHoliday(data: CreateHolidayRequest): Promise<Holiday> {
    return apiFetch<Holiday>(API_ENDPOINTS.SCHOOL.HOLIDAYS, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteHoliday(id: string): Promise<void> {
    await apiFetch(API_ENDPOINTS.SCHOOL.holidayById(id), {
        method: "DELETE",
    });
}
