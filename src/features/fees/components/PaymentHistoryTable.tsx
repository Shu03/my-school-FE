import type { JSX } from "react";

import { CheckCircle2, Printer, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { formatCurrency, formatDate } from "../lib/format";
import type { FeePayment } from "../types/fee.types";

interface PaymentHistoryTableProps {
    payments: FeePayment[];
    isLoading: boolean;
    onPrintReceipt?: (payment: FeePayment) => void;
}

export function PaymentHistoryTable({
    payments,
    isLoading,
    onPrintReceipt,
}: PaymentHistoryTableProps): JSX.Element {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading payments...</span>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="border-border/60 flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
                <Receipt className="text-muted-foreground/60 size-8" />
                <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {payments.map((payment) => {
                const recordedByName = payment.recordedBy
                    ? `${payment.recordedBy.firstName} ${payment.recordedBy.lastName}`
                    : "—";

                return (
                    <div
                        key={payment.id}
                        className="group bg-card ring-border/70 relative flex flex-col rounded-2xl shadow-sm ring-1 transition-shadow hover:shadow-md"
                    >
                        {/* Stub header */}
                        <div className="bg-muted/40 flex items-center justify-between gap-3 rounded-t-2xl px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                                <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                                    <Receipt className="size-4.5" />
                                </span>
                                <div className="leading-tight">
                                    <p className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
                                        Payment receipt
                                    </p>
                                    <p className="font-mono text-xs font-semibold">
                                        #{payment.id.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide uppercase">
                                <CheckCircle2 className="size-3.5" />
                                Paid
                            </span>
                        </div>

                        {/* Hero amount */}
                        <div className="px-5 pt-5 pb-4">
                            <p className="text-muted-foreground text-[0.7rem] font-medium tracking-wider uppercase">
                                Amount paid
                            </p>
                            <p className="mt-1 text-[1.75rem] leading-none font-bold tracking-tight tabular-nums">
                                {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                Paid on {formatDate(payment.paidOn)}
                            </p>
                        </div>

                        {/* Perforation */}
                        <div className="relative">
                            <div className="border-border/70 mx-5 border-t border-dashed" />
                            <span className="bg-background absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full" />
                            <span className="bg-background absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full" />
                        </div>

                        {/* Details */}
                        <dl className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-2 text-xs">
                            <div className="flex items-center justify-between gap-3">
                                <dt className="text-muted-foreground">Recorded by</dt>
                                <dd className="font-medium">{recordedByName}</dd>
                            </div>
                            {payment.note && (
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-muted-foreground shrink-0">Note</dt>
                                    <dd className="text-right">{payment.note}</dd>
                                </div>
                            )}
                        </dl>

                        <div className="px-5 pt-2 pb-5">
                            {onPrintReceipt ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => onPrintReceipt(payment)}
                                >
                                    <Printer className="size-4" />
                                    Print receipt
                                </Button>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
