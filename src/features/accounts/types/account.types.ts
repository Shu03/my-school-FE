import type { Role } from "@/types/api";

/** Decimal amount serialized as a string by the API (e.g. "1500", "250.5"). */
export type Money = string;

export interface AccountUser {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string | null;
    role: Role;
}

export interface AccountSummary {
    totalDeposited: Money;
    totalWithdrawn: Money;
    totalSpent: Money;
    totalBalance: Money;
    withdrawnBalance: Money;
}

export interface Deposit {
    id: string;
    amount: Money;
    depositedOn: string;
    note: string | null;
    recordedById: string | null;
    recordedBy: AccountUser | null;
    createdAt: string;
    updatedAt: string;
}

export interface Withdrawal {
    id: string;
    amount: Money;
    withdrawnOn: string;
    /** Free-text name of the person who took the cash. */
    withdrawnBy: string | null;
    note: string | null;
    spent: Money;
    remaining: Money;
    recordedById: string | null;
    recordedBy: AccountUser | null;
    createdAt: string;
    updatedAt: string;
}

export interface Bill {
    id: string;
    withdrawalId: string;
    amount: Money;
    billedOn: string;
    category: string;
    vendor: string | null;
    billNumber: string | null;
    note: string | null;
    recordedById: string | null;
    recordedBy: AccountUser | null;
    createdAt: string;
    updatedAt: string;
}

/** Paginated list shape returned by the accounts endpoints. */
export interface AccountsPage<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

/** Inclusive `YYYY-MM-DD` date range. */
export interface DateRange {
    startDate?: string;
    endDate?: string;
}

export interface AccountsListParams extends DateRange {
    page?: number;
    limit?: number;
}

export interface BillsListParams extends AccountsListParams {
    withdrawalId?: string;
}

export interface CreateDepositRequest {
    amount: number;
    depositedOn: string;
    note?: string;
}

export type UpdateDepositRequest = Partial<CreateDepositRequest>;

export interface CreateWithdrawalRequest {
    amount: number;
    withdrawnOn: string;
    withdrawnBy?: string;
    note?: string;
}

export type UpdateWithdrawalRequest = Partial<CreateWithdrawalRequest>;

export interface CreateBillRequest {
    withdrawalId: string;
    amount: number;
    billedOn: string;
    category: string;
    vendor?: string;
    billNumber?: string;
    note?: string;
}

export type UpdateBillRequest = Partial<CreateBillRequest>;
