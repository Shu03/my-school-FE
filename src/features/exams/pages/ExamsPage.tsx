import { useState } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";

import {
    EXAM_PAGINATION,
    EXAM_STATUS,
    EXAM_TYPE_LABELS,
    EXAM_TYPE_LIST,
    type ExamStatus,
    type ExamType,
} from "@constants/exams.constants";
import { PERMISSIONS } from "@constants/permissions.constants";
import { examDetail } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useCurrentAcademicYear } from "@features/academic-years";
import { hasPermission, useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ExamFormDialog } from "../components/ExamFormDialog";
import { ExamsPagination } from "../components/ExamsPagination";
import { ExamsTable } from "../components/ExamsTable";
import {
    useCreateExam,
    useDiscardExam,
    useExamsList,
    useFinalizeExam,
    useUnlockExam,
    useUpdateExam,
} from "../hooks/useExams";
import { getExamErrorMessage } from "../lib/errors";
import type { ExamFormValues } from "../schemas/exam.schema";
import type { Exam } from "../types/exam.types";

const ALL = "all";

export function ExamsPage(): JSX.Element {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;
    const isStudent = user?.role === Role.STUDENT;
    const canManage = isAdmin || hasPermission(user?.permissions, PERMISSIONS.GRADES_WRITE);

    const [classFilter, setClassFilter] = useState<string>(ALL);
    const [typeFilter, setTypeFilter] = useState<string>(ALL);
    const [statusFilter, setStatusFilter] = useState<ExamStatus>(EXAM_STATUS.ACTIVE);
    const [page, setPage] = useState<number>(EXAM_PAGINATION.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(EXAM_PAGINATION.DEFAULT_LIMIT);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Exam | null>(null);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        !isStudent && Boolean(currentYear?.id),
    );

    const { data, isLoading, isError, refetch } = useExamsList({
        classId: classFilter === ALL ? undefined : classFilter,
        type: typeFilter === ALL ? undefined : (typeFilter as ExamType),
        status: statusFilter,
        page,
        limit,
    });
    const exams = data?.data ?? [];
    const total = data?.total ?? 0;

    const createMutation = useCreateExam();
    const updateMutation = useUpdateExam();
    const finalizeMutation = useFinalizeExam();
    const unlockMutation = useUnlockExam();
    const discardMutation = useDiscardExam();

    const pendingExamId =
        finalizeMutation.variables?.id ??
        unlockMutation.variables?.id ??
        discardMutation.variables?.id ??
        null;

    function handleCreate(): void {
        setEditing(null);
        setFormOpen(true);
    }

    function handleEdit(exam: Exam): void {
        setEditing(exam);
        setFormOpen(true);
    }

    function handleLimitChange(value: number): void {
        setLimit(value);
        setPage(EXAM_PAGINATION.DEFAULT_PAGE);
    }

    async function handleFinalize(exam: Exam): Promise<void> {
        try {
            await finalizeMutation.mutateAsync({ id: exam.id });
            toast.success("Exam finalized successfully.");
        } catch (error) {
            toast.error(getExamErrorMessage(error));
        }
    }

    async function handleUnlock(exam: Exam): Promise<void> {
        try {
            await unlockMutation.mutateAsync({ id: exam.id });
            toast.success("Exam unlocked successfully.");
        } catch (error) {
            toast.error(getExamErrorMessage(error));
        }
    }

    async function handleDiscard(exam: Exam): Promise<void> {
        const confirmed = window.confirm(
            `Discard "${exam.name}"? This removes it from active exams.`,
        );
        if (!confirmed) {
            return;
        }

        try {
            await discardMutation.mutateAsync({ id: exam.id });
            toast.success("Exam discarded successfully.");
        } catch (error) {
            toast.error(getExamErrorMessage(error));
        }
    }

    async function handleFormSubmit(values: ExamFormValues): Promise<void> {
        try {
            if (editing) {
                await updateMutation.mutateAsync({
                    id: editing.id,
                    data: {
                        name: values.name,
                        type: values.type,
                    },
                });
                toast.success("Exam updated successfully.");
            } else {
                await createMutation.mutateAsync({
                    name: values.name,
                    type: values.type,
                    classId: values.classId,
                    academicYearId: currentYear?.id,
                    subjects: values.subjects,
                });
                toast.success("Exam created successfully.");
            }

            setFormOpen(false);
            setEditing(null);
        } catch (error) {
            toast.error(getExamErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                                <ClipboardList className="size-5" />
                                Exams
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Schedule exams and manage grades.
                            </p>
                        </div>
                        {canManage && (
                            <Button onClick={handleCreate}>
                                <Plus className="size-4" />
                                Create exam
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {!isStudent && (
                            <Select
                                value={classFilter}
                                onValueChange={(value) => {
                                    setClassFilter(value);
                                    setPage(EXAM_PAGINATION.DEFAULT_PAGE);
                                }}
                            >
                                <SelectTrigger className="w-52" aria-label="Filter by class">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All classes</SelectItem>
                                    {classes.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name} (Grade {item.gradeLevel})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Select
                            value={typeFilter}
                            onValueChange={(value) => {
                                setTypeFilter(value);
                                setPage(EXAM_PAGINATION.DEFAULT_PAGE);
                            }}
                        >
                            <SelectTrigger className="w-44" aria-label="Filter by type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All types</SelectItem>
                                {EXAM_TYPE_LIST.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {EXAM_TYPE_LABELS[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value as ExamStatus);
                                setPage(EXAM_PAGINATION.DEFAULT_PAGE);
                            }}
                        >
                            <SelectTrigger className="w-40" aria-label="Filter by status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EXAM_STATUS.ACTIVE}>Active</SelectItem>
                                <SelectItem value={EXAM_STATUS.DISCARDED}>Discarded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>Could not load exams. Please try again.</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void refetch()}
                                >
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <ExamsTable
                                exams={exams}
                                isLoading={isLoading}
                                canManage={canManage}
                                isAdmin={isAdmin}
                                pendingExamId={pendingExamId}
                                onView={(exam) => navigate(examDetail(exam.id))}
                                onEdit={handleEdit}
                                onFinalize={(exam) => void handleFinalize(exam)}
                                onUnlock={(exam) => void handleUnlock(exam)}
                                onDiscard={(exam) => void handleDiscard(exam)}
                            />
                            <ExamsPagination
                                page={page}
                                limit={limit}
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={handleLimitChange}
                            />
                        </>
                    )}
                </div>
            </div>

            <ExamFormDialog
                open={formOpen}
                exam={editing}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
