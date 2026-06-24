import type { JSX } from "react";

import { Pencil, Trash2 } from "lucide-react";

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
import type { Term } from "../types/academic-year.types";

interface TermsTableProps {
    terms: Term[];
    isLoading: boolean;
    canDelete: boolean;
    deletingTermId: string | null;
    onEdit: (term: Term) => void;
    onDelete: (term: Term) => void;
}

export function TermsTable({
    terms,
    isLoading,
    canDelete,
    deletingTermId,
    onEdit,
    onDelete,
}: TermsTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead className="w-24 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={4}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading terms...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && terms.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No terms found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        terms.map((term) => (
                            <TableRow key={term.id}>
                                <TableCell className="font-medium">{term.name}</TableCell>
                                <TableCell>{formatDate(term.startDate)}</TableCell>
                                <TableCell>{formatDate(term.endDate)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${term.name}`}
                                            onClick={() => onEdit(term)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        {canDelete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${term.name}`}
                                                onClick={() => onDelete(term)}
                                                disabled={deletingTermId === term.id}
                                            >
                                                {deletingTermId === term.id ? (
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
