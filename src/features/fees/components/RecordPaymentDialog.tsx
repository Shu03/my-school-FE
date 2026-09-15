import type { JSX } from "react";
import { useEffect } from "react";

import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { formatCurrency } from "../lib/format";
import { createPaymentSchema, type PaymentFormValues } from "../schemas/payment.schema";

interface RecordPaymentDialogProps {
    open: boolean;
    isSubmitting: boolean;
    remainingAmount: number;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PaymentFormValues) => Promise<void>;
}

function todayInputValue(): string {
    return new Date().toISOString().slice(0, 10);
}

export function RecordPaymentDialog({
    open,
    isSubmitting,
    remainingAmount,
    onOpenChange,
    onSubmit,
}: RecordPaymentDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<PaymentFormValues>({
        resolver: zodResolver(createPaymentSchema(remainingAmount)),
        defaultValues: {
            amount: 0,
            paidOn: todayInputValue(),
            note: "",
        },
    });

    const enteredAmount = useWatch({ control, name: "amount" });
    const normalizedEnteredAmount =
        typeof enteredAmount === "number" && Number.isFinite(enteredAmount) ? enteredAmount : 0;
    const remainingAfterPayment = Math.max(remainingAmount - normalizedEnteredAmount, 0);
    const overpaymentAmount = Math.max(normalizedEnteredAmount - remainingAmount, 0);
    const hasOverpayment = overpaymentAmount > 0;
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            amount: 0,
            paidOn: todayInputValue(),
            note: "",
        });
    }, [open, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record payment</DialogTitle>
                    <DialogDescription>
                        Record a payment against this fee record. Remaining balance:{" "}
                        <span className="font-medium">{formatCurrency(remainingAmount)}</span>
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div
                        className={`rounded-xl border px-4 py-3 ${
                            hasOverpayment
                                ? "border-destructive/30 bg-destructive/5"
                                : "border-primary/20 bg-primary/5"
                        }`}
                        aria-live="polite"
                    >
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    {hasOverpayment
                                        ? "Amount exceeds balance"
                                        : "After this payment"}
                                </p>
                                <motion.p
                                    key={hasOverpayment ? "overpayment" : remainingAfterPayment}
                                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`mt-1 text-2xl font-semibold tracking-tight ${
                                        hasOverpayment ? "text-destructive" : "text-primary"
                                    }`}
                                >
                                    {hasOverpayment
                                        ? `${formatCurrency(overpaymentAmount)} over`
                                        : formatCurrency(remainingAfterPayment)}
                                </motion.p>
                            </div>
                            <p className="text-muted-foreground max-w-40 text-right text-xs">
                                {hasOverpayment
                                    ? "Reduce the payment amount to continue."
                                    : "will remain unpaid"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            {...register("amount", { valueAsNumber: true })}
                        />
                        {errors.amount && (
                            <p className="text-destructive text-xs">{errors.amount.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paidOn">Paid on</Label>
                        <Input id="paidOn" type="date" {...register("paidOn")} />
                        {errors.paidOn && (
                            <p className="text-destructive text-xs">{errors.paidOn.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Note (optional)</Label>
                        <Input id="note" placeholder="e.g. Cash payment" {...register("note")} />
                        {errors.note && (
                            <p className="text-destructive text-xs">{errors.note.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            Record payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
