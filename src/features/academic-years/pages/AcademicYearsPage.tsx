import { useMemo, useState } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import { academicYearTerms } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { AcademicYearFormDialog } from "../components/AcademicYearFormDialog";
import { AcademicYearsTable } from "../components/AcademicYearsTable";
import { SetCurrentYearDialog } from "../components/SetCurrentYearDialog";
import {
    useAcademicYearsList,
    useCreateAcademicYear,
    useSetCurrentAcademicYear,
    useUpdateAcademicYear,
} from "../hooks/useAcademicYears";
import { getAcademicYearErrorMessage } from "../lib/errors";
import type { CreateAcademicYearFormValues } from "../schemas/academic-year.schema";
import type { AcademicYear } from "../types/academic-year.types";

export function AcademicYearsPage(): JSX.Element {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;

    const [formOpen, setFormOpen] = useState(false);
    const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
    const [setCurrentOpen, setSetCurrentOpen] = useState(false);
    const [targetYear, setTargetYear] = useState<AcademicYear | null>(null);

    const { data, isLoading, isError, refetch } = useAcademicYearsList();
    const createMutation = useCreateAcademicYear();
    const updateMutation = useUpdateAcademicYear();
    const setCurrentMutation = useSetCurrentAcademicYear();

    const years = useMemo(
        () => [...(data ?? [])].sort((a, b) => b.startDate.localeCompare(a.startDate)),
        [data],
    );

    function handleCreate(): void {
        setEditingYear(null);
        setFormOpen(true);
    }

    function handleEdit(year: AcademicYear): void {
        setEditingYear(year);
        setFormOpen(true);
    }

    function handleManageTerms(year: AcademicYear): void {
        navigate(academicYearTerms(year.id));
    }

    function handleOpenSetCurrent(year: AcademicYear): void {
        setTargetYear(year);
        setSetCurrentOpen(true);
    }

    async function handleFormSubmit(values: CreateAcademicYearFormValues): Promise<void> {
        try {
            if (editingYear) {
                await updateMutation.mutateAsync({
                    id: editingYear.id,
                    data: {
                        name: values.name,
                        startDate: values.startDate,
                        endDate: values.endDate,
                    },
                });
                toast.success("Academic year updated successfully.");
            } else {
                await createMutation.mutateAsync(values);
                toast.success("Academic year created successfully.");
            }

            setFormOpen(false);
            setEditingYear(null);
        } catch (error) {
            toast.error(getAcademicYearErrorMessage(error));
        }
    }

    async function handleSetCurrentConfirm(): Promise<void> {
        if (!targetYear) {
            return;
        }

        try {
            await setCurrentMutation.mutateAsync(targetYear.id);
            toast.success(`${targetYear.name} is now the current academic year.`);
            setSetCurrentOpen(false);
            setTargetYear(null);
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
                            <h1 className="text-xl font-semibold tracking-tight">Academic Years</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Create school years, set the current year, and manage terms.
                            </p>
                        </div>
                        <Button onClick={handleCreate}>
                            <CalendarPlus className="size-4" />
                            Create year
                        </Button>
                    </div>
                </div>
                <div className="px-6 py-6">
                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>Could not load academic years.</span>
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
                        <AcademicYearsTable
                            years={years}
                            isLoading={isLoading}
                            canSetCurrent={isAdmin}
                            settingCurrentId={
                                setCurrentMutation.isPending ? setCurrentMutation.variables : null
                            }
                            onEdit={handleEdit}
                            onManageTerms={handleManageTerms}
                            onSetCurrent={handleOpenSetCurrent}
                        />
                    )}
                </div>
            </div>

            <AcademicYearFormDialog
                open={formOpen}
                year={editingYear}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />

            <SetCurrentYearDialog
                open={setCurrentOpen}
                year={targetYear}
                isSubmitting={setCurrentMutation.isPending}
                onOpenChange={setSetCurrentOpen}
                onConfirm={handleSetCurrentConfirm}
            />
        </div>
    );
}
