import { z } from "zod";

import { CLASS_VALIDATION } from "@constants/classes.constants";

const classLevelSchema = z
    .number({ error: "Class is required" })
    .int("Class must be a whole number")
    .min(CLASS_VALIDATION.GRADE_MIN, `Class must be at least ${CLASS_VALIDATION.GRADE_MIN}`)
    .max(CLASS_VALIDATION.GRADE_MAX, `Class must be at most ${CLASS_VALIDATION.GRADE_MAX}`);

export const createClassSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Section name is required")
        .max(
            CLASS_VALIDATION.NAME_MAX,
            `Section name must be at most ${CLASS_VALIDATION.NAME_MAX} characters`,
        ),
    classLevel: classLevelSchema,
    academicYearId: z.string().trim().min(1, "Academic year is required"),
});

export const updateClassSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Section name is required")
            .max(
                CLASS_VALIDATION.NAME_MAX,
                `Section name must be at most ${CLASS_VALIDATION.NAME_MAX} characters`,
            )
            .optional(),
        classLevel: classLevelSchema.optional(),
    })
    .superRefine((values, context) => {
        if (!values.name && values.classLevel === undefined) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["name"],
                message: "At least one field is required",
            });
        }
    });

export const editClassSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Section name is required")
        .max(
            CLASS_VALIDATION.NAME_MAX,
            `Section name must be at most ${CLASS_VALIDATION.NAME_MAX} characters`,
        ),
    classLevel: classLevelSchema,
});

export const editSectionSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Section name is required")
        .max(
            CLASS_VALIDATION.NAME_MAX,
            `Section name must be at most ${CLASS_VALIDATION.NAME_MAX} characters`,
        ),
});

export type CreateClassFormValues = z.infer<typeof createClassSchema>;
export type UpdateClassFormValues = z.infer<typeof updateClassSchema>;
export type EditClassFormValues = z.infer<typeof editClassSchema>;
export type EditSectionFormValues = z.infer<typeof editSectionSchema>;
