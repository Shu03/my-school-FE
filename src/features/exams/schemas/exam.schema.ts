import { z } from "zod";

import { EXAM_TYPE_LIST, EXAM_VALIDATION, type ExamType } from "@constants/exams.constants";

export const examSubjectRowSchema = z.object({
    subjectId: z.string().trim().min(1, "Subject is required"),
    totalMarks: z
        .number({ message: "Total marks is required" })
        .int("Total marks must be a whole number")
        .min(EXAM_VALIDATION.TOTAL_MARKS_MIN, `Minimum is ${EXAM_VALIDATION.TOTAL_MARKS_MIN}`)
        .max(EXAM_VALIDATION.TOTAL_MARKS_MAX, `Maximum is ${EXAM_VALIDATION.TOTAL_MARKS_MAX}`),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be a valid date"),
});

export type ExamSubjectRowValues = z.infer<typeof examSubjectRowSchema>;

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
    subjects: z
        .array(examSubjectRowSchema)
        .min(1, "Add at least one subject")
        .superRefine((subjects, ctx) => {
            const seen = new Set<string>();
            subjects.forEach((subject, index) => {
                if (subject.subjectId && seen.has(subject.subjectId)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Subject already added",
                        path: [index, "subjectId"],
                    });
                }
                seen.add(subject.subjectId);
            });
        }),
});

export type ExamFormValues = z.infer<typeof examSchema>;

/** Schema for the add/edit exam-subject dialog on the detail page. */
export const examSubjectSchema = examSubjectRowSchema;

export type ExamSubjectFormValues = z.infer<typeof examSubjectSchema>;
