import { useMemo, useState } from "react";
import type { JSX } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { EXAM_STATUS, EXAM_TYPE_LABELS } from "@constants/exams.constants";
import { PERMISSIONS } from "@constants/permissions.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { hasPermission, useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { ExamSubjectFormDialog } from "../components/ExamSubjectFormDialog";
import { ExamSubjectPanel } from "../components/ExamSubjectPanel";
import {
    useAddExamSubject,
    useExam,
    useRemoveExamSubject,
    useUpdateExamSubject,
} from "../hooks/useExams";
import { getExamErrorMessage } from "../lib/errors";
import type { ExamSubjectFormValues } from "../schemas/exam.schema";
import type { ExamSubject, ExamSubjectSummary } from "../types/exam.types";

export function ExamDetailPage(): JSX.Element {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const isAdmin = user?.role === Role.ADMIN;
    const isStudent = user?.role === Role.STUDENT;
    const canWrite = isAdmin || hasPermission(user?.permissions, PERMISSIONS.GRADES_WRITE);
    const canReadSummary = isAdmin || hasPermission(user?.permissions, PERMISSIONS.GRADES_READ);

    const { data: exam, isLoading, isError } = useExam(id);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<ExamSubject | null>(null);

    const addSubjectMutation = useAddExamSubject(id);
    const updateSubjectMutation = useUpdateExamSubject(id);
    const removeSubjectMutation = useRemoveExamSubject(id);

    const summaryBySubjectId = useMemo(() => {
        const map = new Map<string, ExamSubjectSummary>();
        for (const summary of exam?.subjectSummaries ?? []) {
            map.set(summary.subjectId, summary);
        }
        return map;
    }, [exam]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading exam...</span>
            </div>
        );
    }

    if (isError || !exam) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>Could not load this exam.</AlertDescription>
            </Alert>
        );
    }

    const isActive = exam.status === EXAM_STATUS.ACTIVE;
    const canEnterGrades = canWrite && isActive && !exam.isFinalized;
    const canManageSubjects = canWrite && isActive && !exam.isFinalized;
    const canRemoveSubject = exam.examSubjects.length > 1;

    const excludeSubjectIds = exam.examSubjects.map((examSubject) => examSubject.subjectId);

    const handleAddClick = (): void => {
        setEditing(null);
        setDialogOpen(true);
    };

    const handleEditClick = (examSubject: ExamSubject): void => {
        setEditing(examSubject);
        setDialogOpen(true);
    };

    const handleRemove = async (examSubject: ExamSubject): Promise<void> => {
        try {
            await removeSubjectMutation.mutateAsync({ subjectId: examSubject.subjectId });
            toast.success("Subject removed.");
        } catch (error) {
            toast.error(getExamErrorMessage(error));
        }
    };

    const handleSubmit = async (values: ExamSubjectFormValues): Promise<void> => {
        try {
            if (editing) {
                await updateSubjectMutation.mutateAsync({
                    subjectId: editing.subjectId,
                    data: { totalMarks: values.totalMarks, date: values.date },
                });
                toast.success("Subject updated.");
            } else {
                await addSubjectMutation.mutateAsync({
                    subjectId: values.subjectId,
                    totalMarks: values.totalMarks,
                    date: values.date,
                });
                toast.success("Subject added.");
            }
            setDialogOpen(false);
        } catch (error) {
            toast.error(getExamErrorMessage(error));
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-3"
                    onClick={() => navigate(ROUTES.EXAMS)}
                >
                    <ArrowLeft className="size-4" />
                    Back to exams
                </Button>

                <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                    <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {exam.name}
                                </h1>
                                <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    <Badge variant="secondary">{EXAM_TYPE_LABELS[exam.type]}</Badge>
                                    <span>
                                        {exam.class.name} (Grade {exam.class.gradeLevel})
                                    </span>
                                    <span>·</span>
                                    <span>
                                        {exam.examSubjects.length} subject
                                        {exam.examSubjects.length === 1 ? "" : "s"}
                                    </span>
                                </div>
                            </div>
                            <div>
                                {exam.status === EXAM_STATUS.DISCARDED ? (
                                    <Badge variant="destructive">Discarded</Badge>
                                ) : exam.isFinalized ? (
                                    <Badge>Finalized</Badge>
                                ) : (
                                    <Badge variant="outline">Active</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {canManageSubjects && (
                <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddClick}>
                        <Plus className="size-4" />
                        Add subject
                    </Button>
                </div>
            )}

            {exam.examSubjects.map((examSubject) => (
                <ExamSubjectPanel
                    key={examSubject.id}
                    exam={exam}
                    examSubject={examSubject}
                    summary={summaryBySubjectId.get(examSubject.subjectId)}
                    isStudent={isStudent}
                    canEnterGrades={canEnterGrades}
                    canReadSummary={canReadSummary}
                    canManageSubjects={canManageSubjects}
                    onEdit={handleEditClick}
                    onRemove={handleRemove}
                    canRemove={canRemoveSubject}
                />
            ))}

            <ExamSubjectFormDialog
                open={dialogOpen}
                gradeLevel={exam.class.gradeLevel}
                excludeSubjectIds={excludeSubjectIds}
                editing={editing}
                isSubmitting={addSubjectMutation.isPending || updateSubjectMutation.isPending}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
