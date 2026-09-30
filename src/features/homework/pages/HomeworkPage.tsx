import { useState } from "react";
import type { JSX } from "react";

import { Link } from "react-router-dom";

import { AlertCircle, NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";

import { HTTP_STATUS } from "@constants/httpStatus.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { ApiError } from "@lib/api/client";
import { formatSectionLabel } from "@lib/section";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";
import {
    hasApprovedAccess,
    isClassTeacherForSection,
    isSubjectTeacherFor,
    useTeacherAccess,
} from "@features/request-access";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { HomeworkFormDialog } from "../components/HomeworkFormDialog";
import { HomeworkList } from "../components/HomeworkList";
import {
    useCreateHomework,
    useDeleteHomework,
    useHomeworkList,
    useUpdateHomework,
} from "../hooks/useHomework";
import { getHomeworkErrorMessage } from "../lib/errors";
import type { HomeworkFormValues } from "../schemas/homework.schema";
import type { Homework } from "../types/homework.types";

const ALL_CLASSES = "all";

export function HomeworkPage(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const isStudent = user?.role === Role.STUDENT;

    const [classFilter, setClassFilter] = useState<string>(ALL_CLASSES);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Homework | null>(null);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        !isStudent && Boolean(currentYear?.id),
    );
    const { assignments = [], approvedRequests = [] } = useTeacherAccess();
    const teacherSectionIds = new Set([
        ...assignments.map((assignment) => assignment.sectionId),
        ...approvedRequests
            .filter((request) => request.type === "HOMEWORK")
            .map((request) => request.sectionId),
    ]);
    const teacherSections = classes.filter((item) => teacherSectionIds.has(item.id));
    const allowedSections = user?.role === Role.ADMIN ? classes : teacherSections;

    function canManageHomework(item: Homework): boolean {
        if (user?.role === Role.ADMIN) return true;
        if (user?.role !== Role.TEACHER || !user.id) return false;
        if (isClassTeacherForSection(assignments, item.sectionId)) return true;
        if (isSubjectTeacherFor(assignments, item.sectionId, item.subjectId)) return true;
        return (
            hasApprovedAccess(approvedRequests, "HOMEWORK", item.sectionId, item.subjectId) &&
            item.createdBy?.userId === user.id
        );
    }

    function canChooseHomeworkSubject(sectionId: string, subjectId: string): boolean {
        if (user?.role === Role.ADMIN || isClassTeacherForSection(assignments, sectionId))
            return true;
        return (
            isSubjectTeacherFor(assignments, sectionId, subjectId) ||
            hasApprovedAccess(approvedRequests, "HOMEWORK", sectionId, subjectId)
        );
    }

    const canCreate =
        user?.role === Role.ADMIN ||
        assignments.some((assignment) => assignment.role === "CLASS_TEACHER") ||
        assignments.some((assignment) => assignment.role === "SUBJECT_TEACHER") ||
        approvedRequests.some((request) => request.type === "HOMEWORK");
    const [accessRequest, setAccessRequest] = useState<{
        sectionId: string;
        subjectId: string;
    } | null>(null);

    function setAccessRequestFromError(
        error: unknown,
        item: Homework | null,
        values?: HomeworkFormValues,
    ): void {
        if (
            user?.role === Role.TEACHER &&
            error instanceof ApiError &&
            error.status === HTTP_STATUS.FORBIDDEN
        ) {
            const sectionId = values?.sectionId ?? item?.sectionId;
            const subjectId = values?.subjectId ?? item?.subjectId;
            if (sectionId && subjectId) setAccessRequest({ sectionId, subjectId });
        }
    }

    const {
        data: homework = [],
        error,
        isLoading,
        isError,
        refetch,
    } = useHomeworkList({
        // Backend scopes student results to their own section.
        sectionId: isStudent || classFilter === ALL_CLASSES ? undefined : classFilter,
    });

    const createMutation = useCreateHomework();
    const updateMutation = useUpdateHomework();
    const deleteMutation = useDeleteHomework();

    function handleCreate(): void {
        setEditing(null);
        setFormOpen(true);
    }

    function handleEdit(item: Homework): void {
        setEditing(item);
        setFormOpen(true);
    }

    async function handleDelete(item: Homework): Promise<void> {
        const confirmed = window.confirm(`Delete "${item.title}"? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteMutation.mutateAsync({ id: item.id });
            toast.success("Homework deleted successfully.");
        } catch (error) {
            setAccessRequestFromError(error, item);
            toast.error(getHomeworkErrorMessage(error));
        }
    }

    async function handleFormSubmit(values: HomeworkFormValues): Promise<void> {
        try {
            if (editing) {
                await updateMutation.mutateAsync({
                    id: editing.id,
                    data: {
                        title: values.title,
                        description: values.description,
                        dueDate: values.dueDate,
                    },
                });
                toast.success("Homework updated successfully.");
            } else {
                await createMutation.mutateAsync({
                    title: values.title,
                    description: values.description,
                    sectionId: values.sectionId,
                    subjectId: values.subjectId,
                    academicYearId: currentYear?.id,
                    dueDate: values.dueDate,
                });
                toast.success("Homework assigned successfully.");
            }

            setFormOpen(false);
            setEditing(null);
        } catch (error) {
            setAccessRequestFromError(error, editing, values);
            toast.error(getHomeworkErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                                <NotebookPen className="size-5" />
                                Homework
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Assignments for classes and subjects.
                            </p>
                        </div>
                        {canCreate && (
                            <Button onClick={handleCreate}>
                                <Plus className="size-4" />
                                Assign homework
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    {!isStudent && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger className="w-52" aria-label="Filter by class">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_CLASSES}>All classes</SelectItem>
                                    {allowedSections.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {formatSectionLabel(item.classLevel, item.name)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>{getHomeworkErrorMessage(error)}</span>
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
                        <HomeworkList
                            homework={homework}
                            isLoading={isLoading}
                            canManage={canManageHomework}
                            deletingHomeworkId={
                                deleteMutation.isPending
                                    ? (deleteMutation.variables?.id ?? null)
                                    : null
                            }
                            onEdit={handleEdit}
                            onDelete={(item) => void handleDelete(item)}
                        />
                    )}
                </div>
            </div>

            <HomeworkFormDialog
                open={formOpen}
                homework={editing}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                sections={allowedSections}
                canChooseSubject={canChooseHomeworkSubject}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />
            {accessRequest && (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                        <span>Additional access is required for this section and subject.</span>
                        <Button asChild variant="outline" size="sm">
                            <Link
                                to={`${ROUTES.REQUEST_ACCESS}?type=HOMEWORK&sectionId=${encodeURIComponent(accessRequest.sectionId)}&subjectId=${encodeURIComponent(accessRequest.subjectId)}`}
                            >
                                Request access
                            </Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
