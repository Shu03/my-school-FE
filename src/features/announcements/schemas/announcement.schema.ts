import { z } from "zod";

import { ANNOUNCEMENT_VALIDATION } from "@constants/announcements.constants";

export const createAnnouncementSchema = z
    .object({
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
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
    })
    .refine((values) => new Date(values.endDate) >= new Date(values.startDate), {
        message: "End date must be on or after the start date",
        path: ["endDate"],
    });

export type CreateAnnouncementFormValues = z.infer<typeof createAnnouncementSchema>;
