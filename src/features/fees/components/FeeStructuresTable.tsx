import type { JSX } from "react";

import { Pencil } from "lucide-react";

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

import { formatCurrency, formatDate } from "../lib/format";
import type { FeeStructure } from "../types/fee.types";

interface FeeStructuresTableProps {
    structures: FeeStructure[];
    isLoading: boolean;
    canManage: boolean;
    onEdit: (structure: FeeStructure) => void;
}

export function FeeStructuresTable({
    structures,
    isLoading,
    canManage,
    onEdit,
}: FeeStructuresTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Grade</TableHead>
                        <TableHead className="text-right">Total amount</TableHead>
                        <TableHead>Due date</TableHead>
                        {canManage && (
                            <TableHead className="w-24 text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={canManage ? 4 : 3}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading fee structures...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && structures.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={canManage ? 4 : 3}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No fee structures found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        structures.map((structure) => (
                            <TableRow key={structure.id}>
                                <TableCell className="font-medium">
                                    Grade {structure.gradeLevel}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatCurrency(structure.totalAmount)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(structure.dueDate)}
                                </TableCell>
                                {canManage && (
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit grade ${structure.gradeLevel} structure`}
                                            onClick={() => onEdit(structure)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
