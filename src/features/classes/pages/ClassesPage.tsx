import { useMemo, useState } from "react";
import type { JSX } from "react";

import { useLocation } from "react-router-dom";

import { AlertCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { useAcademicYearsList, useCurrentAcademicYear } from "@features/academic-years";
import { useSubjectsList } from "@features/subjects";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { ClassesGrid } from "../components/ClassesGrid";
import { ClassesToolbar } from "../components/ClassesToolbar";
import { ClassWorkspaceDialog } from "../components/ClassWorkspaceDialog";
import { useClassesList, useCreateClass } from "../hooks/useClasses";
import { getClassErrorMessage } from "../lib/errors";

export function ClassesPage(): JSX.Element {
    const location = useLocation();
    const returnState = location.state as {
        openClassNumber?: number;
        academicYearId?: string;
    } | null;
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | null>(
        returnState?.academicYearId ?? null,
    );
    const [classLevelFilter, setClassLevelFilter] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedClassNumber, setSelectedClassNumber] = useState<number | null>(
        returnState?.openClassNumber ?? null,
    );

    const { data: years = [] } = useAcademicYearsList();
    const { data: currentYear } = useCurrentAcademicYear();

    const effectiveAcademicYearId = useMemo(
        () => selectedAcademicYearId ?? currentYear?.id ?? years[0]?.id ?? "",
        [currentYear?.id, selectedAcademicYearId, years],
    );

    const classesParams = {
        academicYearId: effectiveAcademicYearId || undefined,
        classLevel: classLevelFilter ? Number(classLevelFilter) : undefined,
    };

    const {
        data: classesData,
        error: classesApiError,
        isLoading: classesLoading,
        isError: classesError,
        refetch,
    } = useClassesList(classesParams, Boolean(effectiveAcademicYearId));

    const createClassMutation = useCreateClass();
    const { data: subjects = [], isLoading: subjectsLoading } = useSubjectsList({});

    const subjectCountByClass = useMemo<Record<number, number>>(
        () =>
            subjects.reduce<Record<number, number>>((counts, subject) => {
                counts[subject.classLevel] = (counts[subject.classLevel] ?? 0) + 1;
                return counts;
            }, {}),
        [subjects],
    );

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
                if (left.classLevel !== right.classLevel) {
                    return left.classLevel - right.classLevel;
                }

                return left.name.localeCompare(right.name);
            }),
        [classesData],
    );

    async function handleCreateSubmit(values: {
        name: string;
        classLevel: number;
        academicYearId: string;
    }): Promise<boolean> {
        try {
            await createClassMutation.mutateAsync({
                name: values.name,
                classLevel: values.classLevel,
                academicYearId: values.academicYearId,
            });
            toast.success("Class created with its first Section.");
            setIsCreating(false);
            return true;
        } catch (error) {
            toast.error(getClassErrorMessage(error));
            return false;
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="border-border/60 from-primary/12 via-primary/5 flex items-start gap-3 rounded-xl border bg-linear-to-br to-transparent px-6 py-5">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <BookOpen className="size-5" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Classes</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage classes, sections, and their subject assignments.
                    </p>
                </div>
            </div>

            <ClassesToolbar
                years={years}
                selectedAcademicYearId={effectiveAcademicYearId}
                classLevelFilter={classLevelFilter}
                onAcademicYearChange={(value) => setSelectedAcademicYearId(value)}
                onClassLevelFilterChange={setClassLevelFilter}
            />

            {classesError ? (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>{getClassErrorMessage(classesApiError)}</span>
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
                    isCreating={isCreating}
                    createAcademicYearId={effectiveAcademicYearId}
                    createAcademicYearName={yearNameById[effectiveAcademicYearId] ?? ""}
                    canCreate={Boolean(effectiveAcademicYearId)}
                    isCreateSubmitting={createClassMutation.isPending}
                    subjectCountByClass={subjectCountByClass}
                    subjectsLoading={subjectsLoading}
                    onStartCreate={() => setIsCreating(true)}
                    onCancelCreate={() => setIsCreating(false)}
                    onCreateSubmit={handleCreateSubmit}
                    onOpenSubjects={setSelectedClassNumber}
                />
            )}

            <ClassWorkspaceDialog
                open={selectedClassNumber !== null}
                academicYearName={yearNameById[effectiveAcademicYearId] ?? ""}
                classNumber={selectedClassNumber}
                onOpenChange={(open) => {
                    if (!open) setSelectedClassNumber(null);
                }}
            />
        </div>
    );
}
