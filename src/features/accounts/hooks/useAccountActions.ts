import { createContext, useContext } from "react";

import type { Bill, Deposit, Withdrawal } from "../types/account.types";

/** Every create/edit/delete entry point on the accounts page, wherever it's triggered from. */
export interface AccountActions {
    addDeposit: () => void;
    editDeposit: (deposit: Deposit) => void;
    deleteDeposit: (deposit: Deposit) => void;
    addWithdrawal: () => void;
    editWithdrawal: (withdrawal: Withdrawal) => void;
    deleteWithdrawal: (withdrawal: Withdrawal) => void;
    addBill: (withdrawalId?: string) => void;
    editBill: (bill: Bill) => void;
    deleteBill: (bill: Bill) => void;
    openWithdrawal: (withdrawalId: string) => void;
    showBillsFor: (withdrawalId: string | null) => void;
    showWithdrawals: () => void;
    /** Id of the entry currently being deleted, for row spinners. */
    deletingId: string | null;
}

export const AccountActionsContext = createContext<AccountActions | null>(null);

export function useAccountActions(): AccountActions {
    const actions = useContext(AccountActionsContext);

    if (!actions) {
        throw new Error("useAccountActions must be used inside AccountActionsProvider");
    }

    return actions;
}
