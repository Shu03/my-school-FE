import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AccountsListParams,
    AccountsPage,
    AccountSummary,
    Bill,
    BillsListParams,
    CreateBillRequest,
    CreateDepositRequest,
    CreateWithdrawalRequest,
    Deposit,
    UpdateBillRequest,
    UpdateDepositRequest,
    UpdateWithdrawalRequest,
    Withdrawal,
} from "../types/account.types";

function withQuery(endpoint: string, params: object): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
}

export async function getAccountSummary(): Promise<AccountSummary> {
    return apiFetch<AccountSummary>(API_ENDPOINTS.ACCOUNTS.SUMMARY, { method: "GET" });
}

// --- Deposits ---

export async function listDeposits(params: AccountsListParams): Promise<AccountsPage<Deposit>> {
    return apiFetch<AccountsPage<Deposit>>(withQuery(API_ENDPOINTS.ACCOUNTS.DEPOSITS, params), {
        method: "GET",
    });
}

export async function createDeposit(data: CreateDepositRequest): Promise<Deposit> {
    return apiFetch<Deposit>(API_ENDPOINTS.ACCOUNTS.DEPOSITS, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateDeposit(id: string, data: UpdateDepositRequest): Promise<Deposit> {
    return apiFetch<Deposit>(API_ENDPOINTS.ACCOUNTS.depositById(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteDeposit(id: string): Promise<Deposit> {
    return apiFetch<Deposit>(API_ENDPOINTS.ACCOUNTS.depositById(id), { method: "DELETE" });
}

// --- Withdrawals ---

export async function listWithdrawals(
    params: AccountsListParams,
): Promise<AccountsPage<Withdrawal>> {
    return apiFetch<AccountsPage<Withdrawal>>(
        withQuery(API_ENDPOINTS.ACCOUNTS.WITHDRAWALS, params),
        { method: "GET" },
    );
}

export async function getWithdrawal(id: string): Promise<Withdrawal> {
    return apiFetch<Withdrawal>(API_ENDPOINTS.ACCOUNTS.withdrawalById(id), { method: "GET" });
}

export async function createWithdrawal(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    return apiFetch<Withdrawal>(API_ENDPOINTS.ACCOUNTS.WITHDRAWALS, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateWithdrawal(
    id: string,
    data: UpdateWithdrawalRequest,
): Promise<Withdrawal> {
    return apiFetch<Withdrawal>(API_ENDPOINTS.ACCOUNTS.withdrawalById(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteWithdrawal(id: string): Promise<Withdrawal> {
    return apiFetch<Withdrawal>(API_ENDPOINTS.ACCOUNTS.withdrawalById(id), { method: "DELETE" });
}

// --- Bills ---

export async function listBills(params: BillsListParams): Promise<AccountsPage<Bill>> {
    return apiFetch<AccountsPage<Bill>>(withQuery(API_ENDPOINTS.ACCOUNTS.BILLS, params), {
        method: "GET",
    });
}

export async function createBill(data: CreateBillRequest): Promise<Bill> {
    return apiFetch<Bill>(API_ENDPOINTS.ACCOUNTS.BILLS, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateBill(id: string, data: UpdateBillRequest): Promise<Bill> {
    return apiFetch<Bill>(API_ENDPOINTS.ACCOUNTS.billById(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteBill(id: string): Promise<Bill> {
    return apiFetch<Bill>(API_ENDPOINTS.ACCOUNTS.billById(id), { method: "DELETE" });
}
