import { z } from "zod";

import { PERMISSION_LIST, type Permission } from "@constants/permissions.constants";

const permissionEnum = z.enum(PERMISSION_LIST as [Permission, ...Permission[]]);

export const presetSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Preset name is required")
        .max(50, "Name must be at most 50 characters"),
    permissions: z.array(permissionEnum).min(1, "Select at least one permission"),
});

export const assignmentSchema = z
    .object({
        classId: z.string().trim().min(1, "Class is required"),
        role: z.enum(["CLASS_TEACHER", "SUBJECT_TEACHER"]),
        subjectId: z.string().trim().optional(),
    })
    .superRefine((values, context) => {
        if (values.role === "SUBJECT_TEACHER" && !values.subjectId) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["subjectId"],
                message: "Subject is required for a subject teacher",
            });
        }
    });

export const teacherProfileSchema = z.object({
    employeeCode: z
        .string()
        .trim()
        .min(1, "Employee code is required")
        .max(20, "Employee code must be at most 20 characters"),
    joiningDate: z.string().trim().optional(),
});

export type PresetFormValues = z.infer<typeof presetSchema>;
export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
export type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>;
