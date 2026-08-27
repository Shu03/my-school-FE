import { z } from "zod";

import { HOMEWORK_VALIDATION } from "@constants/homework.constants";

export const homeworkSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(
            HOMEWORK_VALIDATION.TITLE_MAX,
            `Title must be at most ${HOMEWORK_VALIDATION.TITLE_MAX} characters`,
        ),
    description: z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(
            HOMEWORK_VALIDATION.DESCRIPTION_MAX,
            `Description must be at most ${HOMEWORK_VALIDATION.DESCRIPTION_MAX} characters`,
        ),
    classId: z.string().trim().min(1, "Class is required"),
    subjectId: z.string().trim().min(1, "Subject is required"),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be a valid date"),
});

export type HomeworkFormValues = z.infer<typeof homeworkSchema>;
