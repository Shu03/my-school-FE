import { useMemo, useState } from "react";
import type { JSX } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Button } from "@/components/ui/button";

import { TermFormDialog } from "../components/TermFormDialog";
import { TermsTable } from "../components/TermsTable";
import {
    useAcademicYear,
    useAcademicYearTerms,
    useCreateTerm,
    useDeleteTerm,
    useUpdateTerm,
} from "../hooks/useAcademicYears";
import { getAcademicYearErrorMessage } from "../lib/errors";
import { formatDate } from "../lib/format";
import type { CreateTermFormValues } from "../schemas/academic-year.schema";
import type { Term } from "../types/academic-year.types";

export function AcademicYearTermsPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;

    const [formOpen, setFormOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<Term | null>(null);

    const { data: year } = useAcademicYear(id ?? null);
    const { data: terms, isLoading } = useAcademicYearTerms(id ?? null);

    const createTermMutation = useCreateTerm();
    const updateTermMutation = useUpdateTerm();
    const deleteTermMutation = useDeleteTerm();

    const sortedTerms = useMemo(
        () => [...(terms ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)),
        [terms],
    );

    if (!id) {
        return (
            <div className="flex flex-col gap-3">
                <p className="text-destructive text-sm">Academic year id is missing.</p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTES.ACADEMIC_YEARS)}
                >
                    Back
                </Button>
            </div>
        );
    }

    const academicYearId = id;

    if (!year) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <p className="text-muted-foreground text-sm">Loading academic year details...</p>
            </div>
        );
    }

    function handleCreateTerm(): void {
        setEditingTerm(null);
        setFormOpen(true);
    }

    function handleEditTerm(term: Term): void {
        setEditingTerm(term);
        setFormOpen(true);
    }

    async function handleDeleteTerm(term: Term): Promise<void> {
        const confirmed = window.confirm(`Delete ${term.name}? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteTermMutation.mutateAsync({ id: academicYearId, termId: term.id });
            toast.success("Term deleted successfully.");
        } catch (error) {
            toast.error(getAcademicYearErrorMessage(error));
        }
    }

    async function handleFormSubmit(values: CreateTermFormValues): Promise<void> {
        try {
            if (editingTerm) {
                await updateTermMutation.mutateAsync({
                    id: academicYearId,
                    termId: editingTerm.id,
                    data: values,
                });
                toast.success("Term updated successfully.");
            } else {
                await createTermMutation.mutateAsync({ id: academicYearId, data: values });
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
            <Link
                to={ROUTES.ACADEMIC_YEARS}
                className="text-muted-foreground hover:text-foreground group inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors"
            >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                Back to academic years
            </Link>

            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                {year.name} Terms
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Academic year range: {formatDate(year.startDate)} to{" "}
                                {formatDate(year.endDate)}
                            </p>
                        </div>
                        <Button onClick={handleCreateTerm}>
                            <Plus className="size-4" />
                            Add term
                        </Button>
                    </div>
                </div>
                <div className="px-6 py-6">
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
                </div>
            </div>

            <TermFormDialog
                open={formOpen}
                term={editingTerm}
                year={year}
                isSubmitting={createTermMutation.isPending || updateTermMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
