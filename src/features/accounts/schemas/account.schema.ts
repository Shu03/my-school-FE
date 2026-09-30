import { z } from "zod";

import { ACCOUNT_VALIDATION } from "@constants/accounts.constants";

import { toPaise } from "../lib/format";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

const amountSchema = z
    .number({ message: "Enter an amount" })
    .min(ACCOUNT_VALIDATION.AMOUNT_MIN, "Amount must be at least ₹0.01")
    .max(ACCOUNT_VALIDATION.AMOUNT_MAX, "Amount is above the allowed limit")
    .refine(
        (value) => Math.abs(value * 100 - toPaise(value)) < 1e-6,
        "Use at most 2 decimal places",
    );

function optionalText(max: number, label: string): z.ZodString {
    return z.string().trim().max(max, `${label} must be at most ${max} characters`);
}

export const depositFormSchema = z.object({
    amount: amountSchema,
    depositedOn: isoDateSchema,
    note: optionalText(ACCOUNT_VALIDATION.NOTE_MAX, "Note"),
});

export const withdrawalFormSchema = z.object({
    amount: amountSchema,
    withdrawnOn: isoDateSchema,
    withdrawnBy: optionalText(ACCOUNT_VALIDATION.WITHDRAWN_BY_MAX, "Name"),
    note: optionalText(ACCOUNT_VALIDATION.NOTE_MAX, "Note"),
});

export const billFormSchema = z.object({
    withdrawalId: z.string().min(1, "Choose the withdrawal this bill was paid from"),
    amount: amountSchema,
    billedOn: isoDateSchema,
    category: z
        .string()
        .trim()
        .min(1, "Enter a category")
        .max(
            ACCOUNT_VALIDATION.CATEGORY_MAX,
            `Category must be at most ${ACCOUNT_VALIDATION.CATEGORY_MAX} characters`,
        ),
    vendor: optionalText(ACCOUNT_VALIDATION.VENDOR_MAX, "Vendor"),
    billNumber: optionalText(ACCOUNT_VALIDATION.BILL_NUMBER_MAX, "Bill number"),
    note: optionalText(ACCOUNT_VALIDATION.NOTE_MAX, "Note"),
});

export type DepositFormValues = z.infer<typeof depositFormSchema>;
export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;
export type BillFormValues = z.infer<typeof billFormSchema>;
