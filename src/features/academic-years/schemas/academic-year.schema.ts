import { z } from "zod";

import { ACADEMIC_YEAR_VALIDATION } from "@constants/academicYears.constants";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

function isStartBeforeEnd(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return start.getTime() < end.getTime();
}

export const createAcademicYearSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Name is required")
            .max(
                ACADEMIC_YEAR_VALIDATION.NAME_MAX,
                `Name must be at most ${ACADEMIC_YEAR_VALIDATION.NAME_MAX} characters`,
            ),
        startDate: isoDateSchema,
        endDate: isoDateSchema,
        copyClassStructureFromCurrent: z.boolean().optional(),
    })
    .superRefine((values, ctx) => {
        if (!isStartBeforeEnd(values.startDate, values.endDate)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message: "End date must be after start date",
            });
        }
    });

export const updateAcademicYearSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Name is required")
            .max(
                ACADEMIC_YEAR_VALIDATION.NAME_MAX,
                `Name must be at most ${ACADEMIC_YEAR_VALIDATION.NAME_MAX} characters`,
            )
            .optional(),
        startDate: isoDateSchema.optional(),
        endDate: isoDateSchema.optional(),
    })
    .superRefine((values, ctx) => {
        if (!values.name && !values.startDate && !values.endDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["name"],
                message: "At least one field is required",
            });
        }

        if (
            values.startDate &&
            values.endDate &&
            !isStartBeforeEnd(values.startDate, values.endDate)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message: "End date must be after start date",
            });
        }
    });

export const createTermSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Term name is required")
            .max(
                ACADEMIC_YEAR_VALIDATION.TERM_NAME_MAX,
                `Term name must be at most ${ACADEMIC_YEAR_VALIDATION.TERM_NAME_MAX} characters`,
            ),
        startDate: isoDateSchema,
        endDate: isoDateSchema,
    })
    .superRefine((values, ctx) => {
        if (!isStartBeforeEnd(values.startDate, values.endDate)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message: "End date must be after start date",
            });
        }
    });

export const updateTermSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Term name is required")
            .max(
                ACADEMIC_YEAR_VALIDATION.TERM_NAME_MAX,
                `Term name must be at most ${ACADEMIC_YEAR_VALIDATION.TERM_NAME_MAX} characters`,
            )
            .optional(),
        startDate: isoDateSchema.optional(),
        endDate: isoDateSchema.optional(),
    })
    .superRefine((values, ctx) => {
        if (!values.name && !values.startDate && !values.endDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["name"],
                message: "At least one field is required",
            });
        }

        if (
            values.startDate &&
            values.endDate &&
            !isStartBeforeEnd(values.startDate, values.endDate)
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message: "End date must be after start date",
            });
        }
    });

export type CreateAcademicYearFormValues = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearFormValues = z.infer<typeof updateAcademicYearSchema>;
export type CreateTermFormValues = z.infer<typeof createTermSchema>;
export type UpdateTermFormValues = z.infer<typeof updateTermSchema>;
