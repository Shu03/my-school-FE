import { useMemo, useState } from "react";
import type { JSX, ReactNode } from "react";

import { toast } from "sonner";

import { ConfirmDialog } from "@components/common/ConfirmDialog";

import { AccountActionsContext, type AccountActions } from "../hooks/useAccountActions";
import {
    useAccountSummary,
    useCreateBill,
    useCreateDeposit,
    useCreateWithdrawal,
    useDeleteBill,
    useDeleteDeposit,
    useDeleteWithdrawal,
    useUpdateBill,
    useUpdateDeposit,
    useUpdateWithdrawal,
} from "../hooks/useAccounts";
import { getAccountsErrorMessage } from "../lib/errors";
import { formatDateOnly, formatMoney, parseMoney, toPaise } from "../lib/format";
import type {
    AccountSummary,
    Bill,
    CreateBillRequest,
    CreateDepositRequest,
    CreateWithdrawalRequest,
    Deposit,
    UpdateBillRequest,
    UpdateDepositRequest,
    UpdateWithdrawalRequest,
    Withdrawal,
} from "../types/account.types";

import { BillFormDialog } from "./BillFormDialog";
import { DepositFormDialog } from "./DepositFormDialog";
import { WithdrawalDetailSheet } from "./WithdrawalDetailSheet";
import { WithdrawalFormDialog } from "./WithdrawalFormDialog";

type FormTarget =
    | { kind: "deposit"; item: Deposit | null }
    | { kind: "withdrawal"; item: Withdrawal | null }
    | { kind: "bill"; item: Bill | null; withdrawalId: string | null };

type DeleteTarget =
    | { kind: "deposit"; item: Deposit }
    | { kind: "withdrawal"; item: Withdrawal }
    | { kind: "bill"; item: Bill };

interface AccountActionsProviderProps {
    onShowBills: (withdrawalId: string | null) => void;
    onShowWithdrawals: () => void;
    children: ReactNode;
}

export function AccountActionsProvider({
    onShowBills,
    onShowWithdrawals,
    children,
}: AccountActionsProviderProps): JSX.Element {
    const { data: summary } = useAccountSummary();

    // Targets outlive their open flag so dialogs keep their content while animating closed.
    const [form, setForm] = useState<FormTarget | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [sheetWithdrawalId, setSheetWithdrawalId] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const createDeposit = useCreateDeposit();
    const updateDeposit = useUpdateDeposit();
    const deleteDeposit = useDeleteDeposit();
    const createWithdrawal = useCreateWithdrawal();
    const updateWithdrawal = useUpdateWithdrawal();
    const deleteWithdrawal = useDeleteWithdrawal();
    const createBill = useCreateBill();
    const updateBill = useUpdateBill();
    const deleteBill = useDeleteBill();

    const isDeleting =
        deleteDeposit.isPending || deleteWithdrawal.isPending || deleteBill.isPending;

    const actions = useMemo<AccountActions>(() => {
        function openForm(target: FormTarget): void {
            setForm(target);
            setFormOpen(true);
        }

        function confirmDelete(target: DeleteTarget): void {
            setPendingDelete(target);
            setDeleteOpen(true);
        }

        return {
            addDeposit: () => openForm({ kind: "deposit", item: null }),
            editDeposit: (item) => openForm({ kind: "deposit", item }),
            deleteDeposit: (item) => confirmDelete({ kind: "deposit", item }),
            addWithdrawal: () => openForm({ kind: "withdrawal", item: null }),
            editWithdrawal: (item) => openForm({ kind: "withdrawal", item }),
            deleteWithdrawal: (item) => confirmDelete({ kind: "withdrawal", item }),
            addBill: (withdrawalId) =>
                openForm({ kind: "bill", item: null, withdrawalId: withdrawalId ?? null }),
            editBill: (item) => openForm({ kind: "bill", item, withdrawalId: item.withdrawalId }),
            deleteBill: (item) => confirmDelete({ kind: "bill", item }),
            openWithdrawal: (withdrawalId) => {
                setSheetWithdrawalId(withdrawalId);
                setSheetOpen(true);
            },
            showBillsFor: (withdrawalId) => {
                setSheetOpen(false);
                onShowBills(withdrawalId);
            },
            showWithdrawals: onShowWithdrawals,
            deletingId: isDeleting ? (pendingDelete?.item.id ?? null) : null,
        };
    }, [isDeleting, pendingDelete, onShowBills, onShowWithdrawals]);

    async function run(task: () => Promise<unknown>, successMessage: string): Promise<void> {
        try {
            await task();
            toast.success(successMessage);
            setFormOpen(false);
        } catch (error) {
            toast.error(getAccountsErrorMessage(error));
        }
    }

    async function handleDelete(): Promise<void> {
        if (!pendingDelete) {
            return;
        }

        const { kind, item } = pendingDelete;

        try {
            if (kind === "deposit") {
                await deleteDeposit.mutateAsync(item.id);
                toast.success("Deposit deleted.");
            } else if (kind === "withdrawal") {
                await deleteWithdrawal.mutateAsync(item.id);
                toast.success("Withdrawal and its bills deleted.");
                if (sheetWithdrawalId === item.id) {
                    setSheetOpen(false);
                    setSheetWithdrawalId(null);
                }
            } else {
                await deleteBill.mutateAsync(item.id);
                toast.success("Bill deleted.");
            }
            setDeleteOpen(false);
        } catch (error) {
            toast.error(getAccountsErrorMessage(error));
        }
    }

    const deleteBlocked = isDepositDeleteBlocked(pendingDelete, summary);

    return (
        <AccountActionsContext.Provider value={actions}>
            {children}

            <WithdrawalDetailSheet
                open={sheetOpen}
                withdrawalId={sheetWithdrawalId}
                onOpenChange={setSheetOpen}
            />

            <DepositFormDialog
                open={formOpen && form?.kind === "deposit"}
                deposit={form?.kind === "deposit" ? form.item : null}
                summary={summary}
                isSubmitting={createDeposit.isPending || updateDeposit.isPending}
                onOpenChange={setFormOpen}
                onCreate={(data: CreateDepositRequest) =>
                    run(
                        () => createDeposit.mutateAsync(data),
                        `Deposit of ${formatMoney(data.amount)} recorded.`,
                    )
                }
                onUpdate={(id: string, data: UpdateDepositRequest) =>
                    run(() => updateDeposit.mutateAsync({ id, data }), "Deposit saved.")
                }
            />

            <WithdrawalFormDialog
                open={formOpen && form?.kind === "withdrawal"}
                withdrawal={form?.kind === "withdrawal" ? form.item : null}
                summary={summary}
                isSubmitting={createWithdrawal.isPending || updateWithdrawal.isPending}
                onOpenChange={setFormOpen}
                onCreate={(data: CreateWithdrawalRequest) =>
                    run(
                        () => createWithdrawal.mutateAsync(data),
                        `${formatMoney(data.amount)} drawn as cash.`,
                    )
                }
                onUpdate={(id: string, data: UpdateWithdrawalRequest) =>
                    run(() => updateWithdrawal.mutateAsync({ id, data }), "Withdrawal saved.")
                }
            />

            <BillFormDialog
                open={formOpen && form?.kind === "bill"}
                bill={form?.kind === "bill" ? form.item : null}
                defaultWithdrawalId={form?.kind === "bill" ? form.withdrawalId : null}
                isSubmitting={createBill.isPending || updateBill.isPending}
                onOpenChange={setFormOpen}
                onCreate={(data: CreateBillRequest) =>
                    run(() => createBill.mutateAsync(data), `${data.category} bill added.`)
                }
                onUpdate={(id: string, data: UpdateBillRequest) =>
                    run(() => updateBill.mutateAsync({ id, data }), "Bill saved.")
                }
            />

            <ConfirmDialog
                open={deleteOpen}
                title={pendingDelete ? DELETE_TITLES[pendingDelete.kind] : ""}
                description={
                    pendingDelete && (
                        <DeleteDescription
                            target={pendingDelete}
                            summary={summary}
                            blocked={deleteBlocked}
                        />
                    )
                }
                confirmLabel={pendingDelete ? DELETE_LABELS[pendingDelete.kind] : "Delete"}
                confirmDisabled={deleteBlocked}
                isPending={isDeleting}
                onOpenChange={setDeleteOpen}
                onConfirm={() => void handleDelete()}
            />
        </AccountActionsContext.Provider>
    );
}

const DELETE_TITLES: Record<DeleteTarget["kind"], string> = {
    deposit: "Delete this deposit?",
    withdrawal: "Delete this withdrawal and its bills?",
    bill: "Delete this bill?",
};

const DELETE_LABELS: Record<DeleteTarget["kind"], string> = {
    deposit: "Delete deposit",
    withdrawal: "Delete withdrawal",
    bill: "Delete bill",
};

/** Deposits can't drop below what has already been withdrawn. */
function isDepositDeleteBlocked(
    target: DeleteTarget | null,
    summary: AccountSummary | undefined,
): boolean {
    return (
        target?.kind === "deposit" &&
        summary !== undefined &&
        toPaise(parseMoney(summary.totalBalance)) < toPaise(parseMoney(target.item.amount))
    );
}

function DeleteDescription({
    target,
    summary,
    blocked,
}: {
    target: DeleteTarget;
    summary: AccountSummary | undefined;
    blocked: boolean;
}): JSX.Element {
    if (target.kind === "deposit") {
        if (blocked && summary) {
            return (
                <>
                    This deposit can&apos;t be removed: total deposits would fall below the{" "}
                    <strong>{formatMoney(summary.totalWithdrawn)}</strong> already withdrawn. Reduce
                    or delete withdrawals first.
                </>
            );
        }

        return (
            <>
                The <strong>{formatMoney(target.item.amount)}</strong> deposit from{" "}
                {formatDateOnly(target.item.depositedOn)} will be removed and the bank balance
                reduced by the same amount.
            </>
        );
    }

    if (target.kind === "withdrawal") {
        const hasBills = parseMoney(target.item.spent) > 0;
        return (
            <>
                The <strong>{formatMoney(target.item.amount)}</strong> withdrawal from{" "}
                {formatDateOnly(target.item.withdrawnOn)} goes back into the bank balance.{" "}
                <strong className="text-destructive">
                    {hasBills
                        ? `All bills recorded under it (${formatMoney(target.item.spent)} in total) will be deleted too.`
                        : "Any bills recorded under it will be deleted too."}
                </strong>{" "}
                This can&apos;t be undone.
            </>
        );
    }

    return (
        <>
            The <strong>{target.item.category}</strong> bill of{" "}
            <strong>{formatMoney(target.item.amount)}</strong> from{" "}
            {formatDateOnly(target.item.billedOn)} will be removed. That amount goes back to its
            withdrawal as cash in hand.
        </>
    );
}
