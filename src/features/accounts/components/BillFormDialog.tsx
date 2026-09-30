import { useEffect } from "react";
import type { JSX } from "react";

import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt } from "lucide-react";
import { toast } from "sonner";

import { ACCOUNT_VALIDATION, BILL_CATEGORY_SUGGESTIONS } from "@constants/accounts.constants";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useWithdrawal, useWithdrawalOptions } from "../hooks/useAccounts";
import {
    formatMoney,
    formatWithdrawalLabel,
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
import { getCategoryIcon } from "../lib/visuals";
import { billFormSchema, type BillFormValues } from "../schemas/account.schema";
import type {
    Bill,
    CreateBillRequest,
    UpdateBillRequest,
    Withdrawal,
} from "../types/account.types";

import { AccountFormDialog, FormField, MoneyInput } from "./AccountFormDialog";
import { BalanceImpact } from "./BalanceImpact";

const CATEGORY_LIST_ID = "bill-category-suggestions";

interface BillFormDialogProps {
    open: boolean;
    bill: Bill | null;
    /** Preselects the withdrawal when adding a bill from a withdrawal's detail view. */
    defaultWithdrawalId?: string | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (data: CreateBillRequest) => Promise<void>;
    /** Only needed when `bill` can be set (edit mode). */
    onUpdate?: (id: string, data: UpdateBillRequest) => Promise<void>;
}

function toFormDefaults(
    bill: Bill | null,
    defaultWithdrawalId?: string | null,
): Partial<BillFormValues> {
    return {
        withdrawalId: bill?.withdrawalId ?? defaultWithdrawalId ?? "",
        amount: bill ? parseMoney(bill.amount) : undefined,
        billedOn: bill ? toDateOnly(bill.billedOn) : todayISODate(),
        category: bill?.category ?? "",
        vendor: bill?.vendor ?? "",
        billNumber: bill?.billNumber ?? "",
        note: bill?.note ?? "",
    };
}

export function BillFormDialog({
    open,
    bill,
    defaultWithdrawalId,
    isSubmitting,
    onOpenChange,
    onCreate,
    onUpdate,
}: BillFormDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        control,
        formState: { errors },
    } = useForm<BillFormValues>({
        resolver: zodResolver(billFormSchema),
        defaultValues: toFormDefaults(bill, defaultWithdrawalId),
    });

    useEffect(() => {
        if (open) {
            reset(toFormDefaults(bill, defaultWithdrawalId));
        }
    }, [open, bill, defaultWithdrawalId, reset]);

    const [selectedId, enteredAmount, category] = useWatch({
        control,
        name: ["withdrawalId", "amount", "category"],
    });

    const { data: recentWithdrawals = [], isLoading: optionsLoading } = useWithdrawalOptions(open);
    const isSelectedListed = recentWithdrawals.some((item) => item.id === selectedId);
    // Older withdrawals fall outside the recent list; fetch the selected one directly.
    const { data: selectedDetail } = useWithdrawal(
        open && selectedId && !optionsLoading && !isSelectedListed ? selectedId : null,
    );

    const withdrawals: Withdrawal[] =
        selectedDetail && !isSelectedListed
            ? [selectedDetail, ...recentWithdrawals]
            : recentWithdrawals;
    const selected = withdrawals.find((item) => item.id === selectedId);

    const entered = Number.isFinite(enteredAmount) ? enteredAmount : 0;
    // A bill already counted against this withdrawal frees its own amount when edited.
    const ownShare =
        bill && selected && bill.withdrawalId === selected.id ? parseMoney(bill.amount) : 0;
    const available = selected
        ? fromPaise(toPaise(parseMoney(selected.remaining)) + toPaise(ownShare))
        : null;
    const nextRemaining =
        available === null ? null : fromPaise(toPaise(available) - toPaise(entered));

    function isSelectable(withdrawal: Withdrawal): boolean {
        return parseMoney(withdrawal.remaining) > 0 || withdrawal.id === bill?.withdrawalId;
    }

    // New bills only list withdrawals that still have cash; edits show all so the current one stays visible.
    const choices = bill ? withdrawals : withdrawals.filter(isSelectable);

    async function handleFormSubmit(values: BillFormValues): Promise<void> {
        if (available !== null && toPaise(values.amount) > toPaise(available)) {
            setError("amount", {
                message: `Only ${formatMoney(available)} is left in this withdrawal.`,
            });
            return;
        }

        if (!bill) {
            await onCreate({
                withdrawalId: values.withdrawalId,
                amount: values.amount,
                billedOn: values.billedOn,
                category: values.category,
                vendor: optionalText(values.vendor),
                billNumber: optionalText(values.billNumber),
                note: optionalText(values.note),
            });
            return;
        }

        const clearedField = (["vendor", "billNumber", "note"] as const).find((field) =>
            isClearingText(values[field], bill[field]),
        );
        if (clearedField) {
            setError(clearedField, { message: CLEAR_TEXT_MESSAGE });
            return;
        }

        const patch = compact<UpdateBillRequest>({
            withdrawalId: changedValue(values.withdrawalId, bill.withdrawalId),
            amount: changedAmount(values.amount, parseMoney(bill.amount)),
            billedOn: changedValue(values.billedOn, toDateOnly(bill.billedOn)),
            category: changedText(values.category, bill.category),
            vendor: changedText(values.vendor, bill.vendor),
            billNumber: changedText(values.billNumber, bill.billNumber),
            note: changedText(values.note, bill.note),
        });

        if (Object.keys(patch).length === 0) {
            toast("No changes to save.");
            onOpenChange(false);
            return;
        }

        await onUpdate?.(bill.id, patch);
    }

    return (
        <AccountFormDialog
            open={open}
            icon={Receipt}
            title={bill ? "Edit bill" : "Add bill"}
            description="Something paid for with withdrawn cash. It reduces what's left of that withdrawal."
            submitLabel={bill ? "Save bill" : "Add bill"}
            isSubmitting={isSubmitting}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit(handleFormSubmit)}
        >
            <FormField
                id="bill-withdrawal"
                label="Paid from"
                error={errors.withdrawalId?.message}
                hint={
                    !optionsLoading && !bill && choices.length === 0
                        ? "Every withdrawal is fully spent. Withdraw more cash before adding a bill."
                        : undefined
                }
            >
                <Controller
                    control={control}
                    name="withdrawalId"
                    render={({ field }) => (
                        <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={optionsLoading}
                        >
                            <SelectTrigger
                                id="bill-withdrawal"
                                ref={field.ref}
                                onBlur={field.onBlur}
                                className="h-10 w-full"
                                aria-invalid={Boolean(errors.withdrawalId)}
                            >
                                <SelectValue
                                    placeholder={
                                        optionsLoading
                                            ? "Loading withdrawals..."
                                            : "Choose a withdrawal"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-72">
                                {choices.map((withdrawal) => (
                                    <SelectItem
                                        key={withdrawal.id}
                                        value={withdrawal.id}
                                        disabled={!isSelectable(withdrawal)}
                                    >
                                        <span className="tabular-nums">
                                            {formatWithdrawalLabel(withdrawal)}
                                        </span>
                                        <span className="text-muted-foreground tabular-nums">
                                            (remaining {formatMoney(withdrawal.remaining)})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </FormField>

            <FormField id="bill-amount" label="Amount" error={errors.amount?.message}>
                <MoneyInput
                    id="bill-amount"
                    aria-invalid={Boolean(errors.amount)}
                    {...register("amount", { valueAsNumber: true })}
                />
            </FormField>

            {available !== null && nextRemaining !== null && (
                <BalanceImpact
                    label="Left in withdrawal"
                    current={available}
                    next={nextRemaining}
                    overLabel="Over cash left"
                />
            )}

            <FormField id="bill-category" label="Category" error={errors.category?.message}>
                <Input
                    id="bill-category"
                    list={CATEGORY_LIST_ID}
                    placeholder="What was it for?"
                    autoComplete="off"
                    maxLength={ACCOUNT_VALIDATION.CATEGORY_MAX}
                    aria-invalid={Boolean(errors.category)}
                    {...register("category")}
                />
                <datalist id={CATEGORY_LIST_ID}>
                    {BILL_CATEGORY_SUGGESTIONS.map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                    ))}
                </datalist>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Common categories">
                    {BILL_CATEGORY_SUGGESTIONS.map((suggestion) => {
                        const Icon = getCategoryIcon(suggestion);
                        const isActive =
                            category?.trim().toLowerCase() === suggestion.toLowerCase();
                        return (
                            <button
                                key={suggestion}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() =>
                                    setValue("category", suggestion, {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    })
                                }
                                className={cn(
                                    "focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-3",
                                    isActive
                                        ? "border-primary/40 bg-primary/12 text-primary"
                                        : "border-border/70 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                                )}
                            >
                                <Icon className="size-3" aria-hidden="true" />
                                {suggestion}
                            </button>
                        );
                    })}
                </div>
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="bill-vendor" label="Vendor" optional error={errors.vendor?.message}>
                    <Input
                        id="bill-vendor"
                        placeholder="Shop or supplier"
                        autoComplete="off"
                        maxLength={ACCOUNT_VALIDATION.VENDOR_MAX}
                        aria-invalid={Boolean(errors.vendor)}
                        {...register("vendor")}
                    />
                </FormField>

                <FormField
                    id="bill-number"
                    label="Bill number"
                    optional
                    error={errors.billNumber?.message}
                >
                    <Input
                        id="bill-number"
                        placeholder="As printed on the receipt"
                        autoComplete="off"
                        maxLength={ACCOUNT_VALIDATION.BILL_NUMBER_MAX}
                        aria-invalid={Boolean(errors.billNumber)}
                        {...register("billNumber")}
                    />
                </FormField>
            </div>

            <FormField id="bill-date" label="Billed on" error={errors.billedOn?.message}>
                <Input
                    id="bill-date"
                    type="date"
                    aria-invalid={Boolean(errors.billedOn)}
                    {...register("billedOn")}
                />
            </FormField>

            <FormField id="bill-note" label="Note" optional error={errors.note?.message}>
                <Textarea
                    id="bill-note"
                    rows={2}
                    maxLength={ACCOUNT_VALIDATION.NOTE_MAX}
                    aria-invalid={Boolean(errors.note)}
                    {...register("note")}
                />
            </FormField>
        </AccountFormDialog>
    );
}
