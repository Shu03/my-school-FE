import { z } from "zod";

export const assignmentSchema = z
    .object({
        sectionId: z.string().trim().min(1, "Section is required"),
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

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;
export type TeacherProfileFormValues = z.infer<typeof teacherProfileSchema>;
