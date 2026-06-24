import { useMemo, useState } from "react";
import type { JSX } from "react";

import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { useAcademicYearsList, useCurrentAcademicYear } from "@features/academic-years";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { AssignTeacherDialog } from "../components/AssignTeacherDialog";
import { ClassesTable } from "../components/ClassesTable";
import { ClassesToolbar } from "../components/ClassesToolbar";
import { ClassFormDialog } from "../components/ClassFormDialog";
import {
    useAssignableTeachers,
    useAssignClassTeacher,
    useClassesList,
    useCreateClass,
    useRemoveClassTeacher,
    useUpdateClass,
} from "../hooks/useClasses";
import { getClassErrorMessage } from "../lib/errors";
import type { CreateClassFormValues } from "../schemas/class.schema";
import type { SchoolClass, TeacherOption } from "../types/class.types";

export function ClassesPage(): JSX.Element {
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | null>(null);
    const [gradeLevelFilter, setGradeLevelFilter] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
    const [teacherTargetClass, setTeacherTargetClass] = useState<SchoolClass | null>(null);

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

    function handleCreateClick(): void {
        setEditingClass(null);
        setFormOpen(true);
    }

    function handleEditClick(schoolClass: SchoolClass): void {
        setEditingClass(schoolClass);
        setFormOpen(true);
    }

    function handleManageTeacherClick(schoolClass: SchoolClass): void {
        setTeacherTargetClass(schoolClass);
        setTeacherDialogOpen(true);
    }

    async function handleClassSubmit(values: CreateClassFormValues): Promise<void> {
        try {
            if (editingClass) {
                await updateClassMutation.mutateAsync({
                    id: editingClass.id,
                    data: {
                        name: values.name,
                        gradeLevel: values.gradeLevel,
                    },
                });
                toast.success("Class updated successfully.");
            } else {
                await createClassMutation.mutateAsync({
                    name: values.name,
                    gradeLevel: values.gradeLevel,
                    academicYearId: values.academicYearId,
                });
                toast.success("Class created successfully.");
            }

            setFormOpen(false);
            setEditingClass(null);
        } catch (error) {
            toast.error(getClassErrorMessage(error));
        }
    }

    async function handleAssignTeacher(teacherId: string): Promise<void> {
        if (!teacherTargetClass) {
            return;
        }

        try {
            await assignTeacherMutation.mutateAsync({ id: teacherTargetClass.id, teacherId });
            toast.success("Class teacher assigned successfully.");
            setTeacherDialogOpen(false);
            setTeacherTargetClass(null);
        } catch (error) {
            toast.error(getClassErrorMessage(error));
        }
    }

    async function handleRemoveTeacher(): Promise<void> {
        if (!teacherTargetClass) {
            return;
        }

        try {
            await removeTeacherMutation.mutateAsync({ id: teacherTargetClass.id });
            toast.success("Class teacher removed successfully.");
            setTeacherDialogOpen(false);
            setTeacherTargetClass(null);
        } catch (error) {
            toast.error(getClassErrorMessage(error));
        }
    }

    const teacherActionLoadingClassId =
        assignTeacherMutation.isPending || removeTeacherMutation.isPending
            ? (teacherTargetClass?.id ?? null)
            : null;

    return (
        <div className="flex flex-col gap-6">
            <ClassesToolbar
                years={years}
                selectedAcademicYearId={effectiveAcademicYearId}
                gradeLevelFilter={gradeLevelFilter}
                onAcademicYearChange={(value) => setSelectedAcademicYearId(value)}
                onGradeLevelFilterChange={setGradeLevelFilter}
                onCreateClick={handleCreateClick}
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
                <ClassesTable
                    classes={sortedClasses}
                    isLoading={classesLoading}
                    yearNameById={yearNameById}
                    teacherNameById={teacherNameById}
                    teacherActionLoadingClassId={teacherActionLoadingClassId}
                    onEdit={handleEditClick}
                    onManageTeacher={handleManageTeacherClick}
                />
            )}

            <ClassFormDialog
                open={formOpen}
                schoolClass={editingClass}
                academicYears={years}
                defaultAcademicYearId={effectiveAcademicYearId}
                isSubmitting={createClassMutation.isPending || updateClassMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleClassSubmit}
            />

            <AssignTeacherDialog
                open={teacherDialogOpen}
                schoolClass={teacherTargetClass}
                teachers={teacherOptions}
                isLoadingTeachers={teachersLoading}
                teacherLoadError={teachersError}
                isSubmitting={assignTeacherMutation.isPending || removeTeacherMutation.isPending}
                onOpenChange={setTeacherDialogOpen}
                onAssign={handleAssignTeacher}
                onRemove={handleRemoveTeacher}
            />
        </div>
    );
}
