export const FEE_STATUS = {
    PENDING: "PENDING",
    PARTIAL: "PARTIAL",
    PAID: "PAID",
} as const;

export type FeeStatus = (typeof FEE_STATUS)[keyof typeof FEE_STATUS];

export const FEE_STATUS_LIST = Object.values(FEE_STATUS) as FeeStatus[];

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
    PENDING: "Pending",
    PARTIAL: "Partial",
    PAID: "Paid",
};

export const FEE_VALIDATION = {
    GRADE_LEVEL_MIN: 1,
    GRADE_LEVEL_MAX: 99,
    TOTAL_AMOUNT_MIN: 1,
    PAYMENT_AMOUNT_MIN: 0.01,
    NOTE_MAX: 500,
} as const;
