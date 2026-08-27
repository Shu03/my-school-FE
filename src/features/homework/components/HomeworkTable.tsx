import type { JSX } from "react";

import { NotebookPen, Pencil, Trash2 } from "lucide-react";

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

import { formatDate } from "../lib/format";
import type { Homework } from "../types/homework.types";

interface HomeworkTableProps {
    homework: Homework[];
    isLoading: boolean;
    canManage: boolean;
    deletingHomeworkId: string | null;
    onEdit: (homework: Homework) => void;
    onDelete: (homework: Homework) => void;
}

export function HomeworkTable({
    homework,
    isLoading,
    canManage,
    deletingHomeworkId,
    onEdit,
    onDelete,
}: HomeworkTableProps): JSX.Element {
    const columnCount = canManage ? 5 : 4;

    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Due date</TableHead>
                        {canManage && (
                            <TableHead className="w-28 text-right">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={columnCount}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading homework...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && homework.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={columnCount}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No homework found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        homework.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <NotebookPen className="text-muted-foreground size-4" />
                                        {item.title}
                                    </div>
                                    <p className="text-muted-foreground max-w-md truncate text-xs">
                                        {item.description}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    {item.class.name} (Grade {item.class.gradeLevel})
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-mono">
                                        {item.subject.code}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(item.dueDate)}
                                </TableCell>
                                {canManage && (
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${item.title}`}
                                                onClick={() => onEdit(item)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Delete ${item.title}`}
                                                onClick={() => onDelete(item)}
                                                disabled={deletingHomeworkId === item.id}
                                            >
                                                {deletingHomeworkId === item.id ? (
                                                    <Spinner className="size-4" />
                                                ) : (
                                                    <Trash2 className="size-4" />
                                                )}
                                            </Button>
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
