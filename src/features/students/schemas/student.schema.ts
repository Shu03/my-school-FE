import { z } from "zod";

import { ENROLLMENT_STATUS_LIST, STUDENT_VALIDATION } from "@constants/students.constants";
import type { EnrollmentStatus } from "@constants/students.constants";

const statusEnum = z.enum(ENROLLMENT_STATUS_LIST as [EnrollmentStatus, ...EnrollmentStatus[]]);

const dateOfBirth = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be a valid date")
    .optional();

const rollNumber = z
    .string()
    .trim()
    .max(
        STUDENT_VALIDATION.ROLL_NUMBER_MAX,
        `Roll number must be at most ${STUDENT_VALIDATION.ROLL_NUMBER_MAX} characters`,
    )
    .optional();

export const updateStudentSchema = z
    .object({
        admissionNumber: z
            .string()
            .trim()
            .min(1, "Admission number is required")
            .max(
                STUDENT_VALIDATION.ADMISSION_NUMBER_MAX,
                `Admission number must be at most ${STUDENT_VALIDATION.ADMISSION_NUMBER_MAX} characters`,
            )
            .optional(),
        dateOfBirth,
    })
    .superRefine((values, context) => {
        if (!values.admissionNumber && !values.dateOfBirth) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["admissionNumber"],
                message: "Update at least one field",
            });
        }
    });

export const enrollStudentSchema = z.object({
    classId: z.string().trim().min(1, "Class is required"),
    academicYearId: z.string().trim().optional(),
    rollNumber,
});

export const updateEnrollmentSchema = z
    .object({
        status: statusEnum.optional(),
        rollNumber,
    })
    .superRefine((values, context) => {
        if (!values.status && !values.rollNumber) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["status"],
                message: "Update at least one field",
            });
        }
    });

export type UpdateStudentFormValues = z.infer<typeof updateStudentSchema>;
export type EnrollStudentFormValues = z.infer<typeof enrollStudentSchema>;
export type UpdateEnrollmentFormValues = z.infer<typeof updateEnrollmentSchema>;
