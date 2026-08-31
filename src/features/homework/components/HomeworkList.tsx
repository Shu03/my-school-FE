import type { JSX } from "react";

import { CalendarClock, GraduationCap, NotebookPen, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { formatDate } from "../lib/format";
import type { Homework } from "../types/homework.types";

interface HomeworkListProps {
    homework: Homework[];
    isLoading: boolean;
    canManage: boolean;
    deletingHomeworkId: string | null;
    onEdit: (homework: Homework) => void;
    onDelete: (homework: Homework) => void;
}

function isOverdue(dueDate: string): boolean {
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
}

export function HomeworkList({
    homework,
    isLoading,
    canManage,
    deletingHomeworkId,
    onEdit,
    onDelete,
}: HomeworkListProps): JSX.Element {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading homework...</span>
            </div>
        );
    }

    if (homework.length === 0) {
        return (
            <div className="border-border/60 flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
                <NotebookPen className="text-muted-foreground/60 size-8" />
                <p className="text-muted-foreground text-sm">No homework found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {homework.map((item) => {
                const overdue = isOverdue(item.dueDate);

                return (
                    <Card key={item.id} className="flex flex-col transition-shadow hover:shadow-md">
                        <CardHeader className="gap-3">
                            <div className="flex items-start justify-between gap-2">
                                <Badge variant="secondary" className="font-mono">
                                    {item.subject.code}
                                </Badge>
                                {canManage && (
                                    <div className="-mt-1 -mr-1 flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            aria-label={`Edit ${item.title}`}
                                            onClick={() => onEdit(item)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
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
                                )}
                            </div>
                            <h3 className="flex items-start gap-2 leading-snug font-semibold tracking-tight">
                                <NotebookPen className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                {item.title}
                            </h3>
                        </CardHeader>

                        <CardContent className="flex-1">
                            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                                {item.description || "No description provided."}
                            </p>
                        </CardContent>

                        <CardFooter className="border-border/60 text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <GraduationCap className="size-3.5" />
                                {item.class.name} (Grade {item.class.gradeLevel})
                            </span>
                            <span
                                className={
                                    overdue
                                        ? "text-destructive flex items-center gap-1.5 font-medium"
                                        : "flex items-center gap-1.5"
                                }
                            >
                                <CalendarClock className="size-3.5" />
                                Due {formatDate(item.dueDate)}
                            </span>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
