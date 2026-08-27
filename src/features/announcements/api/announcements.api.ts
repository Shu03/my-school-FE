import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    Announcement,
    AnnouncementsListParams,
    AnnouncementsListResponse,
    CreateAnnouncementRequest,
    UpdateAnnouncementRequest,
} from "../types/announcement.types";

export async function listAnnouncements(
    params: AnnouncementsListParams,
): Promise<AnnouncementsListResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.ANNOUNCEMENTS.BASE}?${queryString}`
        : API_ENDPOINTS.ANNOUNCEMENTS.BASE;

    return apiFetch<AnnouncementsListResponse>(endpoint, {
        method: "GET",
    });
}

export async function getAnnouncementById(id: string): Promise<Announcement> {
    return apiFetch<Announcement>(API_ENDPOINTS.ANNOUNCEMENTS.byId(id), {
        method: "GET",
    });
}

export async function createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    return apiFetch<Announcement>(API_ENDPOINTS.ANNOUNCEMENTS.BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateAnnouncement(
    id: string,
    data: UpdateAnnouncementRequest,
): Promise<Announcement> {
    return apiFetch<Announcement>(API_ENDPOINTS.ANNOUNCEMENTS.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteAnnouncement(id: string): Promise<void> {
    await apiFetch<void>(API_ENDPOINTS.ANNOUNCEMENTS.byId(id), {
        method: "DELETE",
    });
}
