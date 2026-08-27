import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    createAnnouncement,
    deleteAnnouncement,
    getAnnouncementById,
    listAnnouncements,
    updateAnnouncement,
} from "../api/announcements.api";
import type {
    Announcement,
    AnnouncementsListParams,
    AnnouncementsListResponse,
    CreateAnnouncementRequest,
    UpdateAnnouncementRequest,
} from "../types/announcement.types";

/** Query-key factory for the announcements feature. */
export const announcementsKeys = {
    all: ["announcements"] as const,
    lists: () => [...announcementsKeys.all, "list"] as const,
    list: (params: AnnouncementsListParams) => [...announcementsKeys.lists(), params] as const,
    details: () => [...announcementsKeys.all, "detail"] as const,
    detail: (id: string) => [...announcementsKeys.details(), id] as const,
};

export function useAnnouncementsList(
    params: AnnouncementsListParams,
): UseQueryResult<AnnouncementsListResponse> {
    return useQuery({
        queryKey: announcementsKeys.list(params),
        queryFn: () => listAnnouncements(params),
    });
}

export function useAnnouncement(id: string | null): UseQueryResult<Announcement> {
    return useQuery({
        queryKey: announcementsKeys.detail(id ?? ""),
        queryFn: () => getAnnouncementById(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateAnnouncement(): UseMutationResult<
    Announcement,
    Error,
    CreateAnnouncementRequest
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAnnouncement,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: announcementsKeys.lists() });
        },
    });
}

export function useUpdateAnnouncement(): UseMutationResult<
    Announcement,
    Error,
    { id: string; data: UpdateAnnouncementRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateAnnouncement(id, data),
        onSuccess: (announcement) => {
            void queryClient.invalidateQueries({ queryKey: announcementsKeys.lists() });
            void queryClient.invalidateQueries({
                queryKey: announcementsKeys.detail(announcement.id),
            });
        },
    });
}

export function useDeleteAnnouncement(): UseMutationResult<void, Error, { id: string }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => deleteAnnouncement(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: announcementsKeys.lists() });
        },
    });
}
