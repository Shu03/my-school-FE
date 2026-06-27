import { z } from "zod";

import { CLASS_VALIDATION } from "@constants/classes.constants";

const gradeLevelSchema = z
    .number({ error: "Grade level is required" })
    .int("Grade level must be a whole number")
    .min(CLASS_VALIDATION.GRADE_MIN, "Grade level must be at least 1")
    .max(CLASS_VALIDATION.GRADE_MAX, "Grade level must be at most 99");

export const createClassSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Class name is required")
        .max(
            CLASS_VALIDATION.NAME_MAX,
            `Class name must be at most ${CLASS_VALIDATION.NAME_MAX} characters`,
        ),
    gradeLevel: gradeLevelSchema,
    academicYearId: z.string().trim().min(1, "Academic year is required"),
});

export const updateClassSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Class name is required")
            .max(
                CLASS_VALIDATION.NAME_MAX,
                `Class name must be at most ${CLASS_VALIDATION.NAME_MAX} characters`,
            )
            .optional(),
        gradeLevel: gradeLevelSchema.optional(),
    })
    .superRefine((values, context) => {
        if (!values.name && values.gradeLevel === undefined) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["name"],
                message: "At least one field is required",
            });
        }
    });

export const assignClassTeacherSchema = z.object({
    teacherId: z.string().trim().min(1, "Teacher is required"),
});

export const editClassSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Class name is required")
        .max(
            CLASS_VALIDATION.NAME_MAX,
            `Class name must be at most ${CLASS_VALIDATION.NAME_MAX} characters`,
        ),
    gradeLevel: gradeLevelSchema,
});

export type CreateClassFormValues = z.infer<typeof createClassSchema>;
export type UpdateClassFormValues = z.infer<typeof updateClassSchema>;
export type EditClassFormValues = z.infer<typeof editClassSchema>;
export type AssignClassTeacherFormValues = z.infer<typeof assignClassTeacherSchema>;
