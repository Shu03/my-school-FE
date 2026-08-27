import { useState } from "react";
import type { JSX } from "react";

import { AlertCircle, BookText, Plus } from "lucide-react";
import { toast } from "sonner";

import { PERMISSIONS } from "@constants/permissions.constants";

import { Role } from "@/types/api";

import { hasPermission, useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SubjectFormDialog } from "../components/SubjectFormDialog";
import { SubjectsTable } from "../components/SubjectsTable";
import {
    useCreateSubject,
    useDeleteSubject,
    useSubjectsList,
    useUpdateSubject,
} from "../hooks/useSubjects";
import { getSubjectDeleteErrorMessage, getSubjectErrorMessage } from "../lib/errors";
import type { CreateSubjectFormValues } from "../schemas/subject.schema";
import type { Subject } from "../types/subject.types";

export function SubjectsPage(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;
    const canManage = isAdmin || hasPermission(user?.permissions, PERMISSIONS.SUBJECT_MANAGE);

    const [gradeLevelFilter, setGradeLevelFilter] = useState("");
    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    const {
        data: subjects = [],
        isLoading,
        isError,
        refetch,
    } = useSubjectsList({
        gradeLevel: gradeLevelFilter ? Number(gradeLevelFilter) : undefined,
        search: search || undefined,
    });

    const createSubjectMutation = useCreateSubject();
    const updateSubjectMutation = useUpdateSubject();
    const deleteSubjectMutation = useDeleteSubject();

    function handleCreate(): void {
        setEditingSubject(null);
        setFormOpen(true);
    }

    function handleEdit(subject: Subject): void {
        setEditingSubject(subject);
        setFormOpen(true);
    }

    async function handleDelete(subject: Subject): Promise<void> {
        const confirmed = window.confirm(`Delete ${subject.name}? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteSubjectMutation.mutateAsync({ id: subject.id });
            toast.success("Subject deleted successfully.");
        } catch (error) {
            toast.error(getSubjectDeleteErrorMessage(error));
        }
    }

    async function handleFormSubmit(values: CreateSubjectFormValues): Promise<void> {
        try {
            if (editingSubject) {
                await updateSubjectMutation.mutateAsync({
                    id: editingSubject.id,
                    data: {
                        name: values.name,
                        code: values.code,
                        description: values.description,
                    },
                });
                toast.success("Subject updated successfully.");
            } else {
                await createSubjectMutation.mutateAsync(values);
                toast.success("Subject created successfully.");
            }

            setFormOpen(false);
            setEditingSubject(null);
        } catch (error) {
            toast.error(getSubjectErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                                <BookText className="size-5" />
                                Subjects
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Manage grade-wise subjects and their metadata.
                            </p>
                        </div>
                        {canManage && (
                            <Button onClick={handleCreate}>
                                <Plus className="size-4" />
                                Add subject
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={99}
                            placeholder="Filter grade"
                            className="w-34"
                            value={gradeLevelFilter}
                            onChange={(event) => setGradeLevelFilter(event.target.value)}
                        />
                        <Input
                            type="search"
                            placeholder="Search by name"
                            className="w-56"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>Could not load subjects.</span>
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
                        <SubjectsTable
                            subjects={subjects}
                            isLoading={isLoading}
                            canManage={canManage}
                            canDelete={isAdmin}
                            deletingSubjectId={
                                deleteSubjectMutation.isPending
                                    ? (deleteSubjectMutation.variables?.id ?? null)
                                    : null
                            }
                            onEdit={handleEdit}
                            onDelete={(subject) => void handleDelete(subject)}
                        />
                    )}
                </div>
            </div>

            <SubjectFormDialog
                open={formOpen}
                subject={editingSubject}
                isSubmitting={createSubjectMutation.isPending || updateSubjectMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
