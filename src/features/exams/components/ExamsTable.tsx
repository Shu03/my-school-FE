import type { JSX } from "react";

import { CheckCircle2, Lock, LockOpen, Pencil, Trash2 } from "lucide-react";

import { EXAM_STATUS, EXAM_TYPE_LABELS } from "@constants/exams.constants";

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

import type { Exam } from "../types/exam.types";

interface ExamsTableProps {
    exams: Exam[];
    isLoading: boolean;
    canManage: boolean;
    isAdmin: boolean;
    pendingExamId: string | null;
    onView: (exam: Exam) => void;
    onEdit: (exam: Exam) => void;
    onFinalize: (exam: Exam) => void;
    onUnlock: (exam: Exam) => void;
    onDiscard: (exam: Exam) => void;
}

export function ExamsTable({
    exams,
    isLoading,
    canManage,
    isAdmin,
    pendingExamId,
    onView,
    onEdit,
    onFinalize,
    onUnlock,
    onDiscard,
}: ExamsTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-40 text-right">
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
                                        Loading exams...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && exams.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No exams found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        exams.map((exam) => {
                            const isActive = exam.status === EXAM_STATUS.ACTIVE;
                            const isPending = pendingExamId === exam.id;
                            const canEdit = canManage && isActive && !exam.isFinalized;

                            return (
                                <TableRow key={exam.id}>
                                    <TableCell>
                                        <Button
                                            variant="link"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => onView(exam)}
                                        >
                                            {exam.name}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {EXAM_TYPE_LABELS[exam.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {exam.class.name} (Grade {exam.class.gradeLevel})
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {exam.examSubjects.length === 0 ? (
                                                <span className="text-muted-foreground text-sm">
                                                    —
                                                </span>
                                            ) : (
                                                exam.examSubjects.map((examSubject) => (
                                                    <Badge
                                                        key={examSubject.id}
                                                        variant="secondary"
                                                        className="font-mono"
                                                    >
                                                        {examSubject.subject.code}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {exam.status === EXAM_STATUS.DISCARDED ? (
                                            <Badge variant="destructive">Discarded</Badge>
                                        ) : exam.isFinalized ? (
                                            <Badge>Finalized</Badge>
                                        ) : (
                                            <Badge variant="outline">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit ${exam.name}`}
                                                    onClick={() => onEdit(exam)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            )}
                                            {canManage && isActive && !exam.isFinalized && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Finalize ${exam.name}`}
                                                    onClick={() => onFinalize(exam)}
                                                    disabled={isPending}
                                                >
                                                    {isPending ? (
                                                        <Spinner className="size-4" />
                                                    ) : (
                                                        <CheckCircle2 className="size-4" />
                                                    )}
                                                </Button>
                                            )}
                                            {isAdmin && isActive && exam.isFinalized && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Unlock ${exam.name}`}
                                                    onClick={() => onUnlock(exam)}
                                                    disabled={isPending}
                                                >
                                                    <LockOpen className="size-4" />
                                                </Button>
                                            )}
                                            {isAdmin && isActive && !exam.isFinalized && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Discard ${exam.name}`}
                                                    onClick={() => onDiscard(exam)}
                                                    disabled={isPending}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                            {!canManage && !isAdmin && (
                                                <Lock className="text-muted-foreground/40 size-4" />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </div>
    );
}
