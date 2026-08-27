import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    CreateHomeworkRequest,
    Homework,
    HomeworkListParams,
    UpdateHomeworkRequest,
} from "../types/homework.types";

export async function listHomework(params: HomeworkListParams): Promise<Homework[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.HOMEWORK.BASE}?${queryString}`
        : API_ENDPOINTS.HOMEWORK.BASE;

    return apiFetch<Homework[]>(endpoint, {
        method: "GET",
    });
}

export async function getHomeworkById(id: string): Promise<Homework> {
    return apiFetch<Homework>(API_ENDPOINTS.HOMEWORK.byId(id), {
        method: "GET",
    });
}

export async function createHomework(data: CreateHomeworkRequest): Promise<Homework> {
    return apiFetch<Homework>(API_ENDPOINTS.HOMEWORK.BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateHomework(id: string, data: UpdateHomeworkRequest): Promise<Homework> {
    return apiFetch<Homework>(API_ENDPOINTS.HOMEWORK.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteHomework(id: string): Promise<void> {
    await apiFetch<void>(API_ENDPOINTS.HOMEWORK.byId(id), {
        method: "DELETE",
    });
}
