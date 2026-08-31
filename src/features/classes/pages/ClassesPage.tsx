import { useMemo, useState } from "react";
import type { JSX } from "react";

import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useAcademicYearsList, useCurrentAcademicYear } from "@features/academic-years";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { ClassesGrid } from "../components/ClassesGrid";
import { ClassesToolbar } from "../components/ClassesToolbar";
import { useClassesList, useCreateClass, useUpdateClass } from "../hooks/useClasses";
import { getClassErrorMessage } from "../lib/errors";

export function ClassesPage(): JSX.Element {
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | null>(null);
    const [gradeLevelFilter, setGradeLevelFilter] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const { data: years = [] } = useAcademicYearsList();
    const { data: currentYear } = useCurrentAcademicYear();

    const effectiveAcademicYearId = useMemo(
        () => selectedAcademicYearId ?? currentYear?.id ?? years[0]?.id ?? "",
        [currentYear?.id, selectedAcademicYearId, years],
    );

    const classesParams = {
        academicYearId: effectiveAcademicYearId || undefined,
        gradeLevel: gradeLevelFilter ? Number(gradeLevelFilter) : undefined,
    };

    const {
        data: classesData,
        isLoading: classesLoading,
        isError: classesError,
        refetch,
    } = useClassesList(classesParams, Boolean(effectiveAcademicYearId));

    const createClassMutation = useCreateClass();
    const updateClassMutation = useUpdateClass();

    const yearNameById = useMemo<Record<string, string>>(
        () =>
            years.reduce<Record<string, string>>((acc, year) => {
                acc[year.id] = year.name;
                return acc;
            }, {}),
        [years],
    );

    const sortedClasses = useMemo(
        () =>
            [...(classesData ?? [])].sort((left, right) => {
                if (left.gradeLevel !== right.gradeLevel) {
                    return left.gradeLevel - right.gradeLevel;
                }

                return left.name.localeCompare(right.name);
            }),
        [classesData],
    );

    async function handleCreateSubmit(values: {
        name: string;
        gradeLevel: number;
        academicYearId: string;
    }): Promise<boolean> {
        try {
            await createClassMutation.mutateAsync({
                name: values.name,
                gradeLevel: values.gradeLevel,
                academicYearId: values.academicYearId,
            });
            toast.success("Class created successfully.");
            setIsCreating(false);
            return true;
        } catch (error) {
            toast.error(getClassErrorMessage(error));
            return false;
        }
    }

    async function handleUpdate(
        id: string,
        data: { name: string; gradeLevel: number },
    ): Promise<boolean> {
        try {
            await updateClassMutation.mutateAsync({ id, data });
            toast.success("Class updated successfully.");
            return true;
        } catch (error) {
            toast.error(getClassErrorMessage(error));
            return false;
        }
    }

    const updatingClassId = updateClassMutation.isPending
        ? (updateClassMutation.variables?.id ?? null)
        : null;

    return (
        <div className="flex flex-col gap-6">
            <ClassesToolbar
                years={years}
                selectedAcademicYearId={effectiveAcademicYearId}
                gradeLevelFilter={gradeLevelFilter}
                onAcademicYearChange={(value) => setSelectedAcademicYearId(value)}
                onGradeLevelFilterChange={setGradeLevelFilter}
            />

            {classesError ? (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Could not load classes.</span>
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
                <ClassesGrid
                    classes={sortedClasses}
                    isLoading={classesLoading}
                    yearNameById={yearNameById}
                    isCreating={isCreating}
                    createAcademicYearId={effectiveAcademicYearId}
                    createAcademicYearName={yearNameById[effectiveAcademicYearId] ?? ""}
                    canCreate={Boolean(effectiveAcademicYearId)}
                    isCreateSubmitting={createClassMutation.isPending}
                    updatingClassId={updatingClassId}
                    onStartCreate={() => setIsCreating(true)}
                    onCancelCreate={() => setIsCreating(false)}
                    onCreateSubmit={handleCreateSubmit}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}
