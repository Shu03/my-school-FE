import type { JSX } from "react";
import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

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

import { paymentSchema, type PaymentFormValues } from "../schemas/payment.schema";

interface RecordPaymentDialogProps {
    open: boolean;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PaymentFormValues) => Promise<void>;
}

function todayInputValue(): string {
    return new Date().toISOString().slice(0, 10);
}

export function RecordPaymentDialog({
    open,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: RecordPaymentDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: 0,
            paidOn: todayInputValue(),
            note: "",
        },
    });

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
                    <DialogDescription>Record a payment against this fee record.</DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
