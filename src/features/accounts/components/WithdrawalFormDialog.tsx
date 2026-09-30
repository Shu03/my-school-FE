import { useEffect } from "react";
import type { JSX } from "react";

import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { HandCoins } from "lucide-react";
import { toast } from "sonner";

import { ACCOUNT_VALIDATION } from "@constants/accounts.constants";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    formatMoney,
    fromPaise,
    parseMoney,
    toDateOnly,
    todayISODate,
    toPaise,
} from "../lib/format";
import {
    changedAmount,
    changedText,
    changedValue,
    CLEAR_TEXT_MESSAGE,
    compact,
    isClearingText,
    optionalText,
} from "../lib/payload";
import { withdrawalFormSchema, type WithdrawalFormValues } from "../schemas/account.schema";
import type {
    AccountSummary,
    CreateWithdrawalRequest,
    UpdateWithdrawalRequest,
    Withdrawal,
} from "../types/account.types";

import { AccountFormDialog, FormField, MoneyInput } from "./AccountFormDialog";
import { BalanceImpact } from "./BalanceImpact";

interface WithdrawalFormDialogProps {
    open: boolean;
    withdrawal: Withdrawal | null;
    summary: AccountSummary | undefined;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (data: CreateWithdrawalRequest) => Promise<void>;
    onUpdate: (id: string, data: UpdateWithdrawalRequest) => Promise<void>;
}

function toFormDefaults(withdrawal: Withdrawal | null): Partial<WithdrawalFormValues> {
    return {
        amount: withdrawal ? parseMoney(withdrawal.amount) : undefined,
        withdrawnOn: withdrawal ? toDateOnly(withdrawal.withdrawnOn) : todayISODate(),
        withdrawnBy: withdrawal?.withdrawnBy ?? "",
        note: withdrawal?.note ?? "",
    };
}

export function WithdrawalFormDialog({
    open,
    withdrawal,
    summary,
    isSubmitting,
    onOpenChange,
    onCreate,
    onUpdate,
}: WithdrawalFormDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        control,
        formState: { errors },
    } = useForm<WithdrawalFormValues>({
        resolver: zodResolver(withdrawalFormSchema),
        defaultValues: toFormDefaults(withdrawal),
    });

    useEffect(() => {
        if (open) {
            reset(toFormDefaults(withdrawal));
        }
    }, [open, withdrawal, reset]);

    const enteredAmount = useWatch({ control, name: "amount" });
    const entered = Number.isFinite(enteredAmount) ? enteredAmount : 0;
    const originalAmount = withdrawal ? parseMoney(withdrawal.amount) : 0;
    const alreadySpent = withdrawal ? parseMoney(withdrawal.spent) : 0;

    // Editing puts the original amount back into the bank before taking the new one.
    const available = summary
        ? fromPaise(toPaise(parseMoney(summary.totalBalance)) + toPaise(originalAmount))
        : null;
    const nextBalance =
        available === null ? null : fromPaise(toPaise(available) - toPaise(entered));

    async function handleFormSubmit(values: WithdrawalFormValues): Promise<void> {
        if (available !== null && toPaise(values.amount) > toPaise(available)) {
            setError("amount", {
                message: `Only ${formatMoney(available)} is available in the bank.`,
            });
            return;
        }

        if (!withdrawal) {
            await onCreate({
                amount: values.amount,
                withdrawnOn: values.withdrawnOn,
                withdrawnBy: optionalText(values.withdrawnBy),
                note: optionalText(values.note),
            });
            return;
        }

        if (toPaise(values.amount) < toPaise(alreadySpent)) {
            setError("amount", {
                message: `Bills already use ${formatMoney(alreadySpent)} of this cash — the amount can't go lower.`,
            });
            return;
        }

        const clearedField = (["withdrawnBy", "note"] as const).find((field) =>
            isClearingText(values[field], withdrawal[field]),
        );
        if (clearedField) {
            setError(clearedField, { message: CLEAR_TEXT_MESSAGE });
            return;
        }

        const patch = compact<UpdateWithdrawalRequest>({
            amount: changedAmount(values.amount, originalAmount),
            withdrawnOn: changedValue(values.withdrawnOn, toDateOnly(withdrawal.withdrawnOn)),
            withdrawnBy: changedText(values.withdrawnBy, withdrawal.withdrawnBy),
            note: changedText(values.note, withdrawal.note),
        });

        if (Object.keys(patch).length === 0) {
            toast("No changes to save.");
            onOpenChange(false);
            return;
        }

        await onUpdate(withdrawal.id, patch);
    }

    return (
        <AccountFormDialog
            open={open}
            icon={HandCoins}
            title={withdrawal ? "Edit withdrawal" : "Withdraw cash"}
            description="Cash taken out of the bank. It becomes cash in hand until bills are recorded against it."
            submitLabel={withdrawal ? "Save withdrawal" : "Withdraw cash"}
            isSubmitting={isSubmitting}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit(handleFormSubmit)}
        >
            <FormField
                id="withdrawal-amount"
                label="Amount"
                error={errors.amount?.message}
                hint={
                    withdrawal && alreadySpent > 0
                        ? `Bills already use ${formatMoney(alreadySpent)} of this cash.`
                        : undefined
                }
            >
                <MoneyInput
                    id="withdrawal-amount"
                    aria-invalid={Boolean(errors.amount)}
                    {...register("amount", { valueAsNumber: true })}
                />
            </FormField>

            {available !== null && nextBalance !== null && (
                <BalanceImpact
                    label="In the bank"
                    current={available}
                    next={nextBalance}
                    overLabel="Over balance"
                />
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    id="withdrawal-date"
                    label="Withdrawn on"
                    error={errors.withdrawnOn?.message}
                >
                    <Input
                        id="withdrawal-date"
                        type="date"
                        aria-invalid={Boolean(errors.withdrawnOn)}
                        {...register("withdrawnOn")}
                    />
                </FormField>

                <FormField
                    id="withdrawal-by"
                    label="Withdrawn by"
                    optional
                    error={errors.withdrawnBy?.message}
                >
                    <Input
                        id="withdrawal-by"
                        placeholder="Who took the cash"
                        autoComplete="off"
                        maxLength={ACCOUNT_VALIDATION.WITHDRAWN_BY_MAX}
                        aria-invalid={Boolean(errors.withdrawnBy)}
                        {...register("withdrawnBy")}
                    />
                </FormField>
            </div>

            <FormField
                id="withdrawal-note"
                label="Note"
                optional
                hint="e.g. Cash for the annual day event"
                error={errors.note?.message}
            >
                <Textarea
                    id="withdrawal-note"
                    rows={3}
                    maxLength={ACCOUNT_VALIDATION.NOTE_MAX}
                    aria-invalid={Boolean(errors.note)}
                    {...register("note")}
                />
            </FormField>
        </AccountFormDialog>
    );
}
