import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
    type QueryKey,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import { ACCOUNT_PAGINATION } from "@constants/accounts.constants";

import {
    createBill,
    createDeposit,
    createWithdrawal,
    deleteBill,
    deleteDeposit,
    deleteWithdrawal,
    getAccountSummary,
    getWithdrawal,
    listBills,
    listDeposits,
    listWithdrawals,
    updateBill,
    updateDeposit,
    updateWithdrawal,
} from "../api/accounts.api";
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

/** Query-key factory for the accounts feature. */
export const accountsKeys = {
    all: ["accounts"] as const,
    summary: () => [...accountsKeys.all, "summary"] as const,
    deposits: () => [...accountsKeys.all, "deposits"] as const,
    depositsList: (params: AccountsListParams) =>
        [...accountsKeys.deposits(), "list", params] as const,
    withdrawals: () => [...accountsKeys.all, "withdrawals"] as const,
    withdrawalsList: (params: AccountsListParams) =>
        [...accountsKeys.withdrawals(), "list", params] as const,
    withdrawalOptions: () => [...accountsKeys.withdrawals(), "options"] as const,
    withdrawalDetail: (id: string) => [...accountsKeys.withdrawals(), "detail", id] as const,
    bills: () => [...accountsKeys.all, "bills"] as const,
    billsList: (params: BillsListParams) => [...accountsKeys.bills(), "list", params] as const,
};

// --- Queries ---

export function useAccountSummary(): UseQueryResult<AccountSummary> {
    return useQuery({
        queryKey: accountsKeys.summary(),
        queryFn: getAccountSummary,
    });
}

export function useDepositsList(params: AccountsListParams): UseQueryResult<AccountsPage<Deposit>> {
    return useQuery({
        queryKey: accountsKeys.depositsList(params),
        queryFn: () => listDeposits(params),
        placeholderData: keepPreviousData,
    });
}

export function useWithdrawalsList(
    params: AccountsListParams,
): UseQueryResult<AccountsPage<Withdrawal>> {
    return useQuery({
        queryKey: accountsKeys.withdrawalsList(params),
        queryFn: () => listWithdrawals(params),
        placeholderData: keepPreviousData,
    });
}

/** Most recent withdrawals, used to populate pickers and label bills. */
export function useWithdrawalOptions(enabled = true): UseQueryResult<Withdrawal[]> {
    return useQuery({
        queryKey: accountsKeys.withdrawalOptions(),
        queryFn: async () => {
            const page = await listWithdrawals({ page: 1, limit: ACCOUNT_PAGINATION.MAX_LIMIT });
            return page.data;
        },
        enabled,
    });
}

export function useWithdrawal(id: string | null): UseQueryResult<Withdrawal> {
    return useQuery({
        queryKey: accountsKeys.withdrawalDetail(id ?? ""),
        queryFn: () => getWithdrawal(id as string),
        enabled: Boolean(id),
    });
}

export function useBillsList(
    params: BillsListParams,
    enabled = true,
): UseQueryResult<AccountsPage<Bill>> {
    return useQuery({
        queryKey: accountsKeys.billsList(params),
        queryFn: () => listBills(params),
        placeholderData: keepPreviousData,
        enabled,
    });
}

// --- Mutations ---

/** Every money movement changes the summary; callers add the lists they affect. */
function useLedgerMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    affected: QueryKey[],
): UseMutationResult<TData, Error, TVariables> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: () => {
            [accountsKeys.summary(), ...affected].forEach((queryKey) => {
                void queryClient.invalidateQueries({ queryKey });
            });
        },
    });
}

export function useCreateDeposit(): UseMutationResult<Deposit, Error, CreateDepositRequest> {
    return useLedgerMutation(createDeposit, [accountsKeys.deposits()]);
}

export function useUpdateDeposit(): UseMutationResult<
    Deposit,
    Error,
    { id: string; data: UpdateDepositRequest }
> {
    return useLedgerMutation(({ id, data }) => updateDeposit(id, data), [accountsKeys.deposits()]);
}

export function useDeleteDeposit(): UseMutationResult<Deposit, Error, string> {
    return useLedgerMutation(deleteDeposit, [accountsKeys.deposits()]);
}

export function useCreateWithdrawal(): UseMutationResult<
    Withdrawal,
    Error,
    CreateWithdrawalRequest
> {
    return useLedgerMutation(createWithdrawal, [accountsKeys.withdrawals()]);
}

export function useUpdateWithdrawal(): UseMutationResult<
    Withdrawal,
    Error,
    { id: string; data: UpdateWithdrawalRequest }
> {
    return useLedgerMutation(
        ({ id, data }) => updateWithdrawal(id, data),
        [accountsKeys.withdrawals()],
    );
}

/** Deleting a withdrawal cascades to its bills on the server. */
export function useDeleteWithdrawal(): UseMutationResult<Withdrawal, Error, string> {
    return useLedgerMutation(deleteWithdrawal, [accountsKeys.withdrawals(), accountsKeys.bills()]);
}

export function useCreateBill(): UseMutationResult<Bill, Error, CreateBillRequest> {
    return useLedgerMutation(createBill, [accountsKeys.bills(), accountsKeys.withdrawals()]);
}

export function useUpdateBill(): UseMutationResult<
    Bill,
    Error,
    { id: string; data: UpdateBillRequest }
> {
    return useLedgerMutation(
        ({ id, data }) => updateBill(id, data),
        [accountsKeys.bills(), accountsKeys.withdrawals()],
    );
}

export function useDeleteBill(): UseMutationResult<Bill, Error, string> {
    return useLedgerMutation(deleteBill, [accountsKeys.bills(), accountsKeys.withdrawals()]);
}
