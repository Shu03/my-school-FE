import type { JSX } from "react";

import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { formatCurrency, formatDate } from "../lib/format";
import type { FeePayment } from "../types/fee.types";

interface PaymentHistoryTableProps {
    payments: FeePayment[];
    isLoading: boolean;
}

export function PaymentHistoryTable({
    payments,
    isLoading,
}: PaymentHistoryTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Recorded by</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading payments...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && payments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No payments recorded yet.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(payment.paidOn)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatCurrency(payment.amount)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {payment.note ?? "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {payment.recordedBy
                                        ? `${payment.recordedBy.firstName} ${payment.recordedBy.lastName}`
                                        : "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
