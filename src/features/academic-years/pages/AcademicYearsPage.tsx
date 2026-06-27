import { useMemo, useState } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, CalendarRange, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { TermFormDialog } from "../components/TermFormDialog";
import { TermsTable } from "../components/TermsTable";
import {
    useCreateTerm,
    useCurrentAcademicYear,
    useDeleteTerm,
    useUpdateTerm,
} from "../hooks/useAcademicYears";
import { getAcademicYearErrorMessage } from "../lib/errors";
import { formatDate } from "../lib/format";
import type { CreateTermFormValues } from "../schemas/academic-year.schema";
import type { Term } from "../types/academic-year.types";

export function AcademicYearsPage(): JSX.Element {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;

    const [formOpen, setFormOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<Term | null>(null);

    const { data: currentYear, isLoading, isError, refetch } = useCurrentAcademicYear();
    const createTermMutation = useCreateTerm();
    const updateTermMutation = useUpdateTerm();
    const deleteTermMutation = useDeleteTerm();

    const sortedTerms = useMemo(
        () =>
            [...(currentYear?.terms ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)),
        [currentYear?.terms],
    );

    function handleCreateTerm(): void {
        setEditingTerm(null);
        setFormOpen(true);
    }

    function handleEditTerm(term: Term): void {
        setEditingTerm(term);
        setFormOpen(true);
    }

    function handleOpenManageAcademicYears(): void {
        navigate(ROUTES.ACADEMIC_YEARS_MANAGE);
    }

    async function handleDeleteTerm(term: Term): Promise<void> {
        if (!currentYear) {
            return;
        }

        const confirmed = window.confirm(`Delete ${term.name}? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteTermMutation.mutateAsync({ id: currentYear.id, termId: term.id });
            toast.success("Term deleted successfully.");
        } catch (error) {
            toast.error(getAcademicYearErrorMessage(error));
        }
    }

    async function handleFormSubmit(values: CreateTermFormValues): Promise<void> {
        if (!currentYear) {
            return;
        }

        try {
            if (editingTerm) {
                await updateTermMutation.mutateAsync({
                    id: currentYear.id,
                    termId: editingTerm.id,
                    data: values,
                });
                toast.success("Term updated successfully.");
            } else {
                await createTermMutation.mutateAsync({ id: currentYear.id, data: values });
                toast.success("Term created successfully.");
            }

            setFormOpen(false);
            setEditingTerm(null);
        } catch (error) {
            toast.error(getAcademicYearErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                Current Academic Year Terms
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {currentYear
                                    ? `${currentYear.name}: ${formatDate(currentYear.startDate)} to ${formatDate(currentYear.endDate)}`
                                    : "Review and manage terms for the current academic year."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleOpenManageAcademicYears}>
                                <CalendarRange className="size-4" />
                                Manage academic years
                            </Button>
                            <Button onClick={handleCreateTerm} disabled={!currentYear}>
                                <Plus className="size-4" />
                                Add term
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-6">
                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>
                                    Could not load current academic year. Set one from Manage
                                    academic years.
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleOpenManageAcademicYears}
                                    >
                                        <Settings2 className="size-4" />
                                        Manage
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void refetch()}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <TermsTable
                            terms={sortedTerms}
                            isLoading={isLoading}
                            canDelete={isAdmin}
                            deletingTermId={
                                deleteTermMutation.isPending
                                    ? (deleteTermMutation.variables?.termId ?? null)
                                    : null
                            }
                            onEdit={handleEditTerm}
                            onDelete={(term) => void handleDeleteTerm(term)}
                        />
                    )}
                </div>
            </div>

            {currentYear && (
                <TermFormDialog
                    open={formOpen}
                    term={editingTerm}
                    year={currentYear}
                    isSubmitting={createTermMutation.isPending || updateTermMutation.isPending}
                    onOpenChange={setFormOpen}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
}
