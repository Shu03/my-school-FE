import { useState, type JSX } from "react";

import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    useCreateSubject,
    useDeleteSubject,
    useSubjectsList,
    useUpdateSubject,
    type Subject,
} from "@features/subjects";

import { ConfirmDialog } from "@components/common/ConfirmDialog";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { SubjectFormDialog } from "../../subjects/components/SubjectFormDialog";
import { getSubjectDeleteErrorMessage, getSubjectErrorMessage } from "../../subjects/lib/errors";
import type { CreateSubjectFormValues } from "../../subjects/schemas/subject.schema";

interface ClassCurriculumSectionProps {
    gradeLevel: number;
    canManage: boolean;
    canDelete: boolean;
}

export function ClassCurriculumSection({
    gradeLevel,
    canManage,
    canDelete,
}: ClassCurriculumSectionProps): JSX.Element {
    const [formOpen, setFormOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

    const { data: subjects = [], isLoading, isError, refetch } = useSubjectsList({ gradeLevel });
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

    async function handleSubmit(values: CreateSubjectFormValues): Promise<void> {
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
                await createSubjectMutation.mutateAsync({ ...values, gradeLevel });
                toast.success("Subject added to this class.");
            }
            setFormOpen(false);
            setEditingSubject(null);
        } catch (error) {
            toast.error(getSubjectErrorMessage(error));
        }
    }

    async function handleDelete(): Promise<void> {
        if (!deletingSubject) return;
        try {
            await deleteSubjectMutation.mutateAsync({ id: deletingSubject.id });
            toast.success("Subject deleted successfully.");
            setDeletingSubject(null);
        } catch (error) {
            toast.error(getSubjectDeleteErrorMessage(error));
        }
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertDescription className="flex items-center justify-between gap-4">
                    <span>Could not load subjects for Class {gradeLevel}.</span>
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
        );
    }

    return (
        <section className="space-y-4" aria-labelledby="class-subjects-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="class-subjects-heading" className="text-lg font-semibold">
                        Class {gradeLevel} subjects
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Shared by every Section in this Class.
                    </p>
                </div>
                {canManage ? (
                    <Button type="button" onClick={handleCreate}>
                        <Plus />
                        Add subject
                    </Button>
                ) : null}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Spinner />
                </div>
            ) : subjects.length === 0 ? (
                <div className="border-border/70 bg-muted/20 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
                    <BookOpen className="text-muted-foreground size-6" />
                    <h3 className="mt-3 text-sm font-semibold">No subjects configured</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Add the curriculum subjects shared by this Class.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                        <article
                            key={subject.id}
                            className="border-border/70 bg-card rounded-xl border p-4 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                                    <BookOpen className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold">
                                        {subject.name}
                                    </h3>
                                    <Badge variant="secondary" className="mt-1 font-mono">
                                        {subject.code}
                                    </Badge>
                                </div>
                                {canManage ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-lg"
                                                aria-label={`Edit ${subject.name}`}
                                                onClick={() => handleEdit(subject)}
                                            >
                                                <Pencil />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit subject</TooltipContent>
                                    </Tooltip>
                                ) : null}
                                {canDelete ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-lg"
                                                className="text-destructive"
                                                aria-label={`Delete ${subject.name}`}
                                                onClick={() => setDeletingSubject(subject)}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete subject</TooltipContent>
                                    </Tooltip>
                                ) : null}
                            </div>
                            <p className="text-muted-foreground mt-3 line-clamp-2 text-xs leading-relaxed">
                                {subject.description ?? "No description provided."}
                            </p>
                        </article>
                    ))}
                </div>
            )}

            <SubjectFormDialog
                open={formOpen}
                subject={editingSubject}
                isSubmitting={createSubjectMutation.isPending || updateSubjectMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleSubmit}
                fixedGradeLevel={gradeLevel}
            />
            <ConfirmDialog
                open={Boolean(deletingSubject)}
                title="Delete subject?"
                description={
                    deletingSubject
                        ? `${deletingSubject.name} will be removed from Class ${gradeLevel}. Subjects with active assignments cannot be deleted.`
                        : ""
                }
                confirmLabel="Delete subject"
                isPending={deleteSubjectMutation.isPending}
                onOpenChange={(open) => {
                    if (!open) setDeletingSubject(null);
                }}
                onConfirm={() => void handleDelete()}
            />
        </section>
    );
}
