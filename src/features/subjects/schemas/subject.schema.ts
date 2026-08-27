import { z } from "zod";

import { SUBJECT_VALIDATION } from "@constants/subjects.constants";

const nameSchema = z
    .string()
    .trim()
    .min(1, "Subject name is required")
    .max(
        SUBJECT_VALIDATION.NAME_MAX,
        `Name must be at most ${SUBJECT_VALIDATION.NAME_MAX} characters`,
    );

const codeSchema = z
    .string()
    .trim()
    .min(1, "Subject code is required")
    .max(
        SUBJECT_VALIDATION.CODE_MAX,
        `Code must be at most ${SUBJECT_VALIDATION.CODE_MAX} characters`,
    )
    .transform((value) => value.toUpperCase());

const descriptionSchema = z
    .string()
    .trim()
    .max(
        SUBJECT_VALIDATION.DESCRIPTION_MAX,
        `Description must be at most ${SUBJECT_VALIDATION.DESCRIPTION_MAX} characters`,
    )
    .optional();

const gradeLevelSchema = z
    .number({ error: "Grade level is required" })
    .int("Grade level must be a whole number")
    .min(SUBJECT_VALIDATION.GRADE_MIN, "Grade level must be at least 1")
    .max(SUBJECT_VALIDATION.GRADE_MAX, "Grade level must be at most 99");

export const createSubjectSchema = z.object({
    name: nameSchema,
    code: codeSchema,
    gradeLevel: gradeLevelSchema,
    description: descriptionSchema,
});

export const editSubjectSchema = z.object({
    name: nameSchema,
    code: codeSchema,
    description: descriptionSchema,
});

export type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;
export type EditSubjectFormValues = z.infer<typeof editSubjectSchema>;
