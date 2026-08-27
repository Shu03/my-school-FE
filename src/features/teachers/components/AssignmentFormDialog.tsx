import { useMemo } from "react";
import type { JSX } from "react";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useClassesList } from "@features/classes";
import { useSubjectsList } from "@features/subjects";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import { assignmentSchema, type AssignmentFormValues } from "../schemas/teacher.schema";

interface AssignmentFormDialogProps {
    open: boolean;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: AssignmentFormValues) => Promise<void>;
}

export function AssignmentFormDialog({
    open,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: AssignmentFormDialogProps): JSX.Element {
    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: { classId: "", role: "SUBJECT_TEACHER", subjectId: "" },
    });

    const classId = watch("classId");
    const role = watch("role");

    const selectedClass = useMemo(
        () => classes.find((item) => item.id === classId) ?? null,
        [classes, classId],
    );

    const { data: subjects = [] } = useSubjectsList({ gradeLevel: selectedClass?.gradeLevel });

    async function handleFormSubmit(values: AssignmentFormValues): Promise<void> {
        await onSubmit({
            classId: values.classId,
            role: values.role,
            subjectId: values.role === "SUBJECT_TEACHER" ? values.subjectId : undefined,
        });
        reset();
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    reset();
                }
                onOpenChange(next);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add assignment</DialogTitle>
                    <DialogDescription>
                        Assign this teacher to a class as a class teacher or subject teacher.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Controller
                            control={control}
                            name="classId"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger aria-label="Select class">
                                        <SelectValue placeholder="Select a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name} (Grade {item.gradeLevel})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.classId && (
                            <p className="text-destructive text-xs">{errors.classId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Controller
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger aria-label="Select role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLASS_TEACHER">Class teacher</SelectItem>
                                        <SelectItem value="SUBJECT_TEACHER">
                                            Subject teacher
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {role === "SUBJECT_TEACHER" && (
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Controller
                                control={control}
                                name="subjectId"
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                        disabled={!selectedClass}
                                    >
                                        <SelectTrigger aria-label="Select subject">
                                            <SelectValue
                                                placeholder={
                                                    selectedClass
                                                        ? "Select a subject"
                                                        : "Select a class first"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                    {subject.name} ({subject.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.subjectId && (
                                <p className="text-destructive text-xs">
                                    {errors.subjectId.message}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            Add assignment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
