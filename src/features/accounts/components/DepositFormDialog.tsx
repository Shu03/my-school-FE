import { useEffect } from "react";
import type { JSX } from "react";

import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownToLine } from "lucide-react";
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
import { depositFormSchema, type DepositFormValues } from "../schemas/account.schema";
import type {
    AccountSummary,
    CreateDepositRequest,
    Deposit,
    UpdateDepositRequest,
} from "../types/account.types";

import { AccountFormDialog, FormField, MoneyInput } from "./AccountFormDialog";
import { BalanceImpact } from "./BalanceImpact";

interface DepositFormDialogProps {
    open: boolean;
    deposit: Deposit | null;
    summary: AccountSummary | undefined;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (data: CreateDepositRequest) => Promise<void>;
    onUpdate: (id: string, data: UpdateDepositRequest) => Promise<void>;
}

function toFormDefaults(deposit: Deposit | null): Partial<DepositFormValues> {
    return {
        amount: deposit ? parseMoney(deposit.amount) : undefined,
        depositedOn: deposit ? toDateOnly(deposit.depositedOn) : todayISODate(),
        note: deposit?.note ?? "",
    };
}

export function DepositFormDialog({
    open,
    deposit,
    summary,
    isSubmitting,
    onOpenChange,
    onCreate,
    onUpdate,
}: DepositFormDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        control,
        formState: { errors },
    } = useForm<DepositFormValues>({
        resolver: zodResolver(depositFormSchema),
        defaultValues: toFormDefaults(deposit),
    });

    useEffect(() => {
        if (open) {
            reset(toFormDefaults(deposit));
        }
    }, [open, deposit, reset]);

    const enteredAmount = useWatch({ control, name: "amount" });
    const entered = Number.isFinite(enteredAmount) ? enteredAmount : 0;
    const originalAmount = deposit ? parseMoney(deposit.amount) : 0;
    const currentBalance = summary ? parseMoney(summary.totalBalance) : null;
    const nextBalance =
        currentBalance === null
            ? null
            : fromPaise(toPaise(currentBalance) - toPaise(originalAmount) + toPaise(entered));

    async function handleFormSubmit(values: DepositFormValues): Promise<void> {
        if (nextBalance !== null && nextBalance < 0 && summary) {
            setError("amount", {
                message: `Total deposits can't fall below the ${formatMoney(summary.totalWithdrawn)} already withdrawn.`,
            });
            return;
        }

        if (!deposit) {
            await onCreate({
                amount: values.amount,
                depositedOn: values.depositedOn,
                note: optionalText(values.note),
            });
            return;
        }

        if (isClearingText(values.note, deposit.note)) {
            setError("note", { message: CLEAR_TEXT_MESSAGE });
            return;
        }

        const patch = compact<UpdateDepositRequest>({
            amount: changedAmount(values.amount, originalAmount),
            depositedOn: changedValue(values.depositedOn, toDateOnly(deposit.depositedOn)),
            note: changedText(values.note, deposit.note),
        });

        if (Object.keys(patch).length === 0) {
            toast("No changes to save.");
            onOpenChange(false);
            return;
        }

        await onUpdate(deposit.id, patch);
    }

    return (
        <AccountFormDialog
            open={open}
            icon={ArrowDownToLine}
            title={deposit ? "Edit deposit" : "Record deposit"}
            description="Money paid into the school account. It adds to the total balance."
            submitLabel={deposit ? "Save deposit" : "Record deposit"}
            isSubmitting={isSubmitting}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit(handleFormSubmit)}
        >
            <FormField id="deposit-amount" label="Amount" error={errors.amount?.message}>
                <MoneyInput
                    id="deposit-amount"
                    aria-invalid={Boolean(errors.amount)}
                    {...register("amount", { valueAsNumber: true })}
                />
            </FormField>

            {currentBalance !== null && nextBalance !== null && (
                <BalanceImpact
                    label="Total balance"
                    current={currentBalance}
                    next={nextBalance}
                    overLabel="Below withdrawn"
                />
            )}

            <FormField id="deposit-date" label="Deposited on" error={errors.depositedOn?.message}>
                <Input
                    id="deposit-date"
                    type="date"
                    aria-invalid={Boolean(errors.depositedOn)}
                    {...register("depositedOn")}
                />
            </FormField>

            <FormField
                id="deposit-note"
                label="Note"
                optional
                hint="e.g. Term 1 fee collection, donation from alumni"
                error={errors.note?.message}
            >
                <Textarea
                    id="deposit-note"
                    rows={3}
                    maxLength={ACCOUNT_VALIDATION.NOTE_MAX}
                    aria-invalid={Boolean(errors.note)}
                    {...register("note")}
                />
            </FormField>
        </AccountFormDialog>
    );
}
