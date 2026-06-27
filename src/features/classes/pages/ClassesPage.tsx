import { useMemo, useState } from "react";
import type { JSX } from "react";

import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useAcademicYearsList, useCurrentAcademicYear } from "@features/academic-years";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { ClassesGrid } from "../components/ClassesGrid";
import { ClassesToolbar } from "../components/ClassesToolbar";
import {
    useAssignableTeachers,
    useAssignClassTeacher,
    useClassesList,
    useCreateClass,
    useRemoveClassTeacher,
    useUpdateClass,
} from "../hooks/useClasses";
import { getClassErrorMessage } from "../lib/errors";
import type { TeacherOption } from "../types/class.types";

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
    const assignTeacherMutation = useAssignClassTeacher();
    const removeTeacherMutation = useRemoveClassTeacher();

    const {
        data: teacherProfiles,
        isLoading: teachersLoading,
        isError: teachersError,
    } = useAssignableTeachers();

    const teacherOptions = useMemo<TeacherOption[]>(
        () =>
            (teacherProfiles ?? [])
                .filter((teacher) => teacher.user.isActive)
                .map((teacher) => ({
                    id: teacher.id,
                    label: `${teacher.user.firstName} ${teacher.user.lastName} (${teacher.employeeCode})`,
                })),
        [teacherProfiles],
    );

    const teacherNameById = useMemo<Record<string, string>>(
        () =>
            teacherOptions.reduce<Record<string, string>>((acc, teacher) => {
                acc[teacher.id] = teacher.label;
                return acc;
            }, {}),
        [teacherOptions],
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

    async function handleAssignTeacher(id: string, teacherId: string): Promise<boolean> {
        try {
            await assignTeacherMutation.mutateAsync({ id, teacherId });
            toast.success("Class teacher assigned successfully.");
            return true;
        } catch (error) {
            toast.error(getClassErrorMessage(error));
            return false;
        }
    }

    async function handleRemoveTeacher(id: string): Promise<boolean> {
        try {
            await removeTeacherMutation.mutateAsync({ id });
            toast.success("Class teacher removed successfully.");
            return true;
        } catch (error) {
            toast.error(getClassErrorMessage(error));
            return false;
        }
    }

    const updatingClassId = updateClassMutation.isPending
        ? (updateClassMutation.variables?.id ?? null)
        : null;
    const assigningClassId = assignTeacherMutation.isPending
        ? (assignTeacherMutation.variables?.id ?? null)
        : null;
    const removingClassId = removeTeacherMutation.isPending
        ? (removeTeacherMutation.variables?.id ?? null)
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

            {teachersError && (
                <Alert>
                    <AlertCircle />
                    <AlertDescription>
                        Teacher options are currently unavailable. Assignment actions may be
                        limited.
                    </AlertDescription>
                </Alert>
            )}

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
                    teacherNameById={teacherNameById}
                    teacherOptions={teacherOptions}
                    isTeachersLoading={teachersLoading}
                    teacherLoadError={teachersError}
                    isCreating={isCreating}
                    createAcademicYearId={effectiveAcademicYearId}
                    createAcademicYearName={yearNameById[effectiveAcademicYearId] ?? ""}
                    canCreate={Boolean(effectiveAcademicYearId)}
                    isCreateSubmitting={createClassMutation.isPending}
                    updatingClassId={updatingClassId}
                    assigningClassId={assigningClassId}
                    removingClassId={removingClassId}
                    onStartCreate={() => setIsCreating(true)}
                    onCancelCreate={() => setIsCreating(false)}
                    onCreateSubmit={handleCreateSubmit}
                    onUpdate={handleUpdate}
                    onAssignTeacher={handleAssignTeacher}
                    onRemoveTeacher={handleRemoveTeacher}
                />
            )}
        </div>
    );
}
