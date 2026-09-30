/**
 * Public API of the accounts feature.
 *
 * Pages are intentionally NOT exported here — router lazy imports pages directly.
 */

export {
    accountsKeys,
    useAccountSummary,
    useBillsList,
    useCreateBill,
    useCreateDeposit,
    useCreateWithdrawal,
    useDeleteBill,
    useDeleteDeposit,
    useDeleteWithdrawal,
    useDepositsList,
    useUpdateBill,
    useUpdateDeposit,
    useUpdateWithdrawal,
    useWithdrawal,
    useWithdrawalOptions,
    useWithdrawalsList,
} from "./hooks/useAccounts";

export type {
    AccountsListParams,
    AccountsPage,
    AccountSummary,
    AccountUser,
    Bill,
    BillsListParams,
    CreateBillRequest,
    CreateDepositRequest,
    CreateWithdrawalRequest,
    Deposit,
    Money,
    UpdateBillRequest,
    UpdateDepositRequest,
    UpdateWithdrawalRequest,
    Withdrawal,
} from "./types/account.types";
