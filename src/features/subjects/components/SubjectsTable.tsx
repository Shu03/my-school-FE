import type { JSX } from "react";

import { BookText, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { Subject } from "../types/subject.types";

interface SubjectsTableProps {
    subjects: Subject[];
    isLoading: boolean;
    canManage: boolean;
    canDelete: boolean;
    deletingSubjectId: string | null;
    onEdit: (subject: Subject) => void;
    onDelete: (subject: Subject) => void;
}

export function SubjectsTable({
    subjects,
    isLoading,
    canManage,
    canDelete,
    deletingSubjectId,
    onEdit,
    onDelete,
}: SubjectsTableProps): JSX.Element {
    const showActions = canManage || canDelete;

    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Description</TableHead>
                        {showActions && (
                            <TableHead className="w-28 text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={showActions ? 5 : 4}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading subjects...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && subjects.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={showActions ? 5 : 4}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No subjects found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        subjects.map((subject) => (
                            <TableRow key={subject.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <BookText className="text-muted-foreground size-4" />
                                        {subject.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-mono">
                                        {subject.code}
                                    </Badge>
                                </TableCell>
                                <TableCell>{subject.gradeLevel}</TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">
                                    {subject.description ?? "—"}
                                </TableCell>
                                {showActions && (
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {canManage && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Edit ${subject.name}`}
                                                            onClick={() => onEdit(subject)}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit</TooltipContent>
                                                </Tooltip>
                                            )}

                                            {canDelete && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Delete ${subject.name}`}
                                                            onClick={() => onDelete(subject)}
                                                            disabled={
                                                                deletingSubjectId === subject.id
                                                            }
                                                        >
                                                            {deletingSubjectId === subject.id ? (
                                                                <Spinner className="size-4" />
                                                            ) : (
                                                                <Trash2 className="size-4" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete</TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
