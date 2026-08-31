import { z } from "zod";

import { EXAM_TYPE_LIST, EXAM_VALIDATION, type ExamType } from "@constants/exams.constants";

export const examSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(
            EXAM_VALIDATION.NAME_MAX,
            `Name must be at most ${EXAM_VALIDATION.NAME_MAX} characters`,
        ),
    type: z.enum(EXAM_TYPE_LIST as [ExamType, ...ExamType[]]),
    classId: z.string().trim().min(1, "Class is required"),
    subjectId: z.string().trim().min(1, "Subject is required"),
    totalMarks: z
        .number({ message: "Total marks is required" })
        .int("Total marks must be a whole number")
        .min(EXAM_VALIDATION.TOTAL_MARKS_MIN, `Minimum is ${EXAM_VALIDATION.TOTAL_MARKS_MIN}`)
        .max(EXAM_VALIDATION.TOTAL_MARKS_MAX, `Maximum is ${EXAM_VALIDATION.TOTAL_MARKS_MAX}`),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date"),
});

export type ExamFormValues = z.infer<typeof examSchema>;
