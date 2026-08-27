/**
 * Public API of the announcements feature.
 *
 * Pages are intentionally not exported here to preserve route-level code splitting.
 */

export {
    announcementsKeys,
    useAnnouncementsList,
    useAnnouncement,
    useCreateAnnouncement,
    useUpdateAnnouncement,
    useDeleteAnnouncement,
} from "./hooks/useAnnouncements";

export type {
    Announcement,
    AnnouncementCreator,
    AnnouncementsListParams,
    AnnouncementsListResponse,
    CreateAnnouncementRequest,
    UpdateAnnouncementRequest,
} from "./types/announcement.types";
