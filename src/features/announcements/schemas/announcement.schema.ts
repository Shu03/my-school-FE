import { z } from "zod";

import { ANNOUNCEMENT_VALIDATION } from "@constants/announcements.constants";

export const createAnnouncementSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(
            ANNOUNCEMENT_VALIDATION.TITLE_MAX,
            `Title must be at most ${ANNOUNCEMENT_VALIDATION.TITLE_MAX} characters`,
        ),
    content: z
        .string()
        .trim()
        .min(1, "Content is required")
        .max(
            ANNOUNCEMENT_VALIDATION.CONTENT_MAX,
            `Content must be at most ${ANNOUNCEMENT_VALIDATION.CONTENT_MAX} characters`,
        ),
});

export type CreateAnnouncementFormValues = z.infer<typeof createAnnouncementSchema>;
