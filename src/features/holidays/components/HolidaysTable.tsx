import type { JSX } from "react";

import { Trash2 } from "lucide-react";

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

import { formatDate } from "../lib/format";
import type { Holiday } from "../types/holiday.types";

interface HolidaysTableProps {
    holidays: Holiday[];
    isLoading: boolean;
    canDelete: boolean;
    deletingHolidayId: string | null;
    onDelete: (holiday: Holiday) => void;
}

export function HolidaysTable({
    holidays,
    isLoading,
    canDelete,
    deletingHolidayId,
    onDelete,
}: HolidaysTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-24 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading holidays...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && holidays.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No holidays found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        holidays.map((holiday) => (
                            <TableRow key={holiday.id}>
                                <TableCell className="font-medium">{holiday.name}</TableCell>
                                <TableCell>{formatDate(holiday.date)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {canDelete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${holiday.name}`}
                                                onClick={() => onDelete(holiday)}
                                                disabled={deletingHolidayId === holiday.id}
                                            >
                                                {deletingHolidayId === holiday.id ? (
                                                    <Spinner className="size-4" />
                                                ) : (
                                                    <Trash2 className="size-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
