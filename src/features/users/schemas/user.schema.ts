import { z } from "zod";

import { MOBILE_NUMBER_PATTERN } from "@constants/auth.constants";
import { USER_VALIDATION } from "@constants/users.constants";

const firstName = z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(
        USER_VALIDATION.NAME_MAX,
        `First name must be at most ${USER_VALIDATION.NAME_MAX} characters`,
    );

const lastName = z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(
        USER_VALIDATION.NAME_MAX,
        `Last name must be at most ${USER_VALIDATION.NAME_MAX} characters`,
    );

const mobileNumber = z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(MOBILE_NUMBER_PATTERN, "Enter a valid 10-digit mobile number");

/** Optional email — empty string is treated as "not provided". */
const optionalEmail = z
    .union([
        z.literal(""),
        z
            .string()
            .trim()
            .email("Enter a valid email address")
            .max(
                USER_VALIDATION.EMAIL_MAX,
                `Email must be at most ${USER_VALIDATION.EMAIL_MAX} characters`,
            ),
    ])
    .optional();

/** Optional ISO date (YYYY-MM-DD); empty string means "not provided". */
const optionalIsoDate = z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")])
    .optional();

const baseUserFields = {
    firstName,
    lastName,
    mobileNumber,
    email: optionalEmail,
};

export const createAdminSchema = z.object({
    ...baseUserFields,
});

export const createTeacherSchema = z.object({
    ...baseUserFields,
    employeeCode: z
        .string()
        .trim()
        .min(1, "Employee code is required")
        .max(
            USER_VALIDATION.EMPLOYEE_CODE_MAX,
            `Employee code must be at most ${USER_VALIDATION.EMPLOYEE_CODE_MAX} characters`,
        ),
    joiningDate: optionalIsoDate,
});

export const createStudentSchema = z.object({
    ...baseUserFields,
    admissionNumber: z
        .string()
        .trim()
        .min(1, "Admission number is required")
        .max(
            USER_VALIDATION.ADMISSION_NUMBER_MAX,
            `Admission number must be at most ${USER_VALIDATION.ADMISSION_NUMBER_MAX} characters`,
        ),
    dateOfBirth: optionalIsoDate,
});

export const updateUserSchema = z.object({
    firstName,
    lastName,
    email: optionalEmail,
});

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;
export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
