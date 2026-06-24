import { useState } from "react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import type { SchoolClass, TeacherOption } from "../types/class.types";

interface AssignTeacherDialogProps {
    open: boolean;
    schoolClass: SchoolClass | null;
    teachers: TeacherOption[];
    isLoadingTeachers: boolean;
    teacherLoadError: boolean;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onAssign: (teacherId: string) => Promise<void>;
    onRemove: () => Promise<void>;
}

export function AssignTeacherDialog({
    open,
    schoolClass,
    teachers,
    isLoadingTeachers,
    teacherLoadError,
    isSubmitting,
    onOpenChange,
    onAssign,
    onRemove,
}: AssignTeacherDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <TeacherAssignmentDialogContent
                key={schoolClass?.id ?? "no-class"}
                schoolClass={schoolClass}
                teachers={teachers}
                isLoadingTeachers={isLoadingTeachers}
                teacherLoadError={teacherLoadError}
                isSubmitting={isSubmitting}
                onAssign={onAssign}
                onRemove={onRemove}
            />
        </Dialog>
    );
}

interface TeacherAssignmentDialogContentProps {
    schoolClass: SchoolClass | null;
    teachers: TeacherOption[];
    isLoadingTeachers: boolean;
    teacherLoadError: boolean;
    isSubmitting: boolean;
    onAssign: (teacherId: string) => Promise<void>;
    onRemove: () => Promise<void>;
}

function TeacherAssignmentDialogContent({
    schoolClass,
    teachers,
    isLoadingTeachers,
    teacherLoadError,
    isSubmitting,
    onAssign,
    onRemove,
}: TeacherAssignmentDialogContentProps): JSX.Element {
    const [teacherId, setTeacherId] = useState<string>(schoolClass?.classTeacherId ?? "");

    const canAssign = Boolean(teacherId) && !teacherLoadError;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Manage class teacher</DialogTitle>
                <DialogDescription>
                    {schoolClass
                        ? `Assign or remove class teacher for ${schoolClass.name}.`
                        : "Assign or remove class teacher."}
                </DialogDescription>
            </DialogHeader>

            {teacherLoadError ? (
                <p className="text-destructive text-sm">
                    Teacher options are unavailable right now. You can still remove the current
                    assignment if one exists.
                </p>
            ) : (
                <div className="space-y-2">
                    <Select value={teacherId} onValueChange={setTeacherId}>
                        <SelectTrigger aria-label="Select class teacher">
                            <SelectValue placeholder="Select a teacher" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingTeachers ? (
                                <div className="text-muted-foreground px-2 py-1.5 text-sm">
                                    Loading teachers...
                                </div>
                            ) : (
                                teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.id}>
                                        {teacher.label}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <DialogFooter>
                {schoolClass?.classTeacherId && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => void onRemove()}
                    >
                        {isSubmitting && <Spinner />}
                        Remove teacher
                    </Button>
                )}
                <Button
                    type="button"
                    disabled={isSubmitting || !canAssign}
                    onClick={() => void onAssign(teacherId)}
                >
                    {isSubmitting && <Spinner />}
                    Assign teacher
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
