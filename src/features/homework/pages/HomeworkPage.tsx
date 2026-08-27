import { useState } from "react";
import type { JSX } from "react";

import { AlertCircle, NotebookPen, Plus } from "lucide-react";
import { toast } from "sonner";

import { PERMISSIONS } from "@constants/permissions.constants";

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

import { HomeworkFormDialog } from "../components/HomeworkFormDialog";
import { HomeworkTable } from "../components/HomeworkTable";
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
    const canManage =
        user?.role === Role.ADMIN || hasPermission(user?.permissions, PERMISSIONS.HOMEWORK_MANAGE);

    const [classFilter, setClassFilter] = useState<string>(ALL_CLASSES);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Homework | null>(null);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const {
        data: homework = [],
        isLoading,
        isError,
        refetch,
    } = useHomeworkList({
        classId: classFilter === ALL_CLASSES ? undefined : classFilter,
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
                    classId: values.classId,
                    subjectId: values.subjectId,
                    academicYearId: currentYear?.id,
                    dueDate: values.dueDate,
                });
                toast.success("Homework assigned successfully.");
            }

            setFormOpen(false);
            setEditing(null);
        } catch (error) {
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
                        {canManage && (
                            <Button onClick={handleCreate}>
                                <Plus className="size-4" />
                                Assign homework
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={classFilter} onValueChange={setClassFilter}>
                            <SelectTrigger className="w-52" aria-label="Filter by class">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_CLASSES}>All classes</SelectItem>
                                {classes.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name} (Grade {item.gradeLevel})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>Could not load homework. Please try again.</span>
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
                        <HomeworkTable
                            homework={homework}
                            isLoading={isLoading}
                            canManage={canManage}
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
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
