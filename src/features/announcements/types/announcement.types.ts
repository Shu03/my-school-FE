import type { Role } from "@/types/api";

export interface AnnouncementCreator {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: AnnouncementCreator | null;
}

export interface AnnouncementsListParams {
    page?: number;
    limit?: number;
}

export interface AnnouncementsListResponse {
    data: Announcement[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateAnnouncementRequest {
    title: string;
    content: string;
}

export interface UpdateAnnouncementRequest {
    title?: string;
    content?: string;
}
