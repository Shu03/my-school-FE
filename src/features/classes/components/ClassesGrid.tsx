import type { JSX } from "react";

import { Stagger, StaggerItem } from "@/components/common/Motion";
import { Spinner } from "@/components/ui/spinner";

import type { SchoolClass, TeacherOption } from "../types/class.types";

import { ClassCard } from "./ClassCard";
import { CreateClassCard } from "./CreateClassCard";

interface ClassesGridProps {
    classes: SchoolClass[];
    isLoading: boolean;
    yearNameById: Record<string, string>;
    teacherNameById: Record<string, string>;
    teacherOptions: TeacherOption[];
    isTeachersLoading: boolean;
    teacherLoadError: boolean;
    isCreating: boolean;
    createAcademicYearId: string;
    createAcademicYearName: string;
    canCreate: boolean;
    isCreateSubmitting: boolean;
    updatingClassId: string | null;
    assigningClassId: string | null;
    removingClassId: string | null;
    onStartCreate: () => void;
    onCancelCreate: () => void;
    onCreateSubmit: (values: {
        name: string;
        gradeLevel: number;
        academicYearId: string;
    }) => Promise<boolean>;
    onUpdate: (id: string, data: { name: string; gradeLevel: number }) => Promise<boolean>;
    onAssignTeacher: (id: string, teacherId: string) => Promise<boolean>;
    onRemoveTeacher: (id: string) => Promise<boolean>;
}

export function ClassesGrid({
    classes,
    isLoading,
    yearNameById,
    teacherNameById,
    teacherOptions,
    isTeachersLoading,
    teacherLoadError,
    isCreating,
    createAcademicYearId,
    createAcademicYearName,
    canCreate,
    isCreateSubmitting,
    updatingClassId,
    assigningClassId,
    removingClassId,
    onStartCreate,
    onCancelCreate,
    onCreateSubmit,
    onUpdate,
    onAssignTeacher,
    onRemoveTeacher,
}: ClassesGridProps): JSX.Element {
    if (isLoading) {
        return (
            <div className="bg-card text-muted-foreground ring-foreground/10 flex items-center justify-center gap-2 rounded-xl py-16 text-sm shadow-sm ring-1">
                <Spinner />
                <span>Loading classes...</span>
            </div>
        );
    }

    return (
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <StaggerItem>
                <CreateClassCard
                    isCreating={isCreating}
                    academicYearId={createAcademicYearId}
                    academicYearName={createAcademicYearName}
                    canCreate={canCreate}
                    isSubmitting={isCreateSubmitting}
                    onStart={onStartCreate}
                    onCancel={onCancelCreate}
                    onSubmit={onCreateSubmit}
                />
            </StaggerItem>

            {classes.map((schoolClass) => (
                <StaggerItem key={schoolClass.id}>
                    <ClassCard
                        schoolClass={schoolClass}
                        yearName={yearNameById[schoolClass.academicYearId] ?? ""}
                        teacherName={
                            schoolClass.classTeacherId
                                ? (teacherNameById[schoolClass.classTeacherId] ?? "Assigned")
                                : null
                        }
                        teacherOptions={teacherOptions}
                        isTeachersLoading={isTeachersLoading}
                        teacherLoadError={teacherLoadError}
                        isUpdating={updatingClassId === schoolClass.id}
                        isAssigning={assigningClassId === schoolClass.id}
                        isRemoving={removingClassId === schoolClass.id}
                        onUpdate={onUpdate}
                        onAssignTeacher={onAssignTeacher}
                        onRemoveTeacher={onRemoveTeacher}
                    />
                </StaggerItem>
            ))}
        </Stagger>
    );
}
