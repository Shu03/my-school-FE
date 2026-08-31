import { z } from "zod";

import { FEE_VALIDATION } from "@constants/fees.constants";

export const paymentSchema = z.object({
    amount: z
        .number({ message: "Amount is required" })
        .min(FEE_VALIDATION.PAYMENT_AMOUNT_MIN, `Minimum is ${FEE_VALIDATION.PAYMENT_AMOUNT_MIN}`),
    paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Paid on must be a valid date"),
    note: z
        .string()
        .trim()
        .max(FEE_VALIDATION.NOTE_MAX, `Note must be at most ${FEE_VALIDATION.NOTE_MAX} characters`)
        .optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
