import { z } from "zod";

import { FEE_VALIDATION } from "@constants/fees.constants";

export const feeStructureSchema = z.object({
    gradeLevel: z
        .number({ message: "Grade level is required" })
        .int("Grade level must be a whole number")
        .min(FEE_VALIDATION.GRADE_LEVEL_MIN, `Minimum is ${FEE_VALIDATION.GRADE_LEVEL_MIN}`)
        .max(FEE_VALIDATION.GRADE_LEVEL_MAX, `Maximum is ${FEE_VALIDATION.GRADE_LEVEL_MAX}`),
    totalAmount: z
        .number({ message: "Total amount is required" })
        .min(FEE_VALIDATION.TOTAL_AMOUNT_MIN, `Minimum is ${FEE_VALIDATION.TOTAL_AMOUNT_MIN}`),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be a valid date"),
});

export type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;
