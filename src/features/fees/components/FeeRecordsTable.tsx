import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { formatCurrency } from "../lib/format";
import type { FeeRecord } from "../types/fee.types";

import { FeeStatusBadge } from "./FeeStatusBadge";

interface FeeRecordsTableProps {
    records: FeeRecord[];
    isLoading: boolean;
    onView: (record: FeeRecord) => void;
}

export function FeeRecordsTable({ records, isLoading, onView }: FeeRecordsTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-20 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading fee records...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && records.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No fee records found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        records.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 font-medium"
                                        onClick={() => onView(record)}
                                    >
                                        {record.student.user.firstName}{" "}
                                        {record.student.user.lastName}
                                    </Button>
                                    <p className="text-muted-foreground font-mono text-xs">
                                        {record.student.admissionNumber}
                                    </p>
                                </TableCell>
                                <TableCell>Grade {record.feeStructure.gradeLevel}</TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatCurrency(record.totalAmount)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatCurrency(record.amountPaid)}
                                </TableCell>
                                <TableCell>
                                    <FeeStatusBadge status={record.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onView(record)}
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
