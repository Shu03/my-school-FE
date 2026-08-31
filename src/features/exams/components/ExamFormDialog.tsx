import { useEffect, useMemo } from "react";
import type { JSX } from "react";

import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { EXAM_TYPE_LABELS, EXAM_TYPE_LIST } from "@constants/exams.constants";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import { toDateInputValue } from "../lib/format";
import { examSchema, type ExamFormValues } from "../schemas/exam.schema";
import type { Exam } from "../types/exam.types";

interface ExamFormDialogProps {
    open: boolean;
    exam: Exam | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ExamFormValues) => Promise<void>;
}

export function ExamFormDialog({
    open,
    exam,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: ExamFormDialogProps): JSX.Element {
    const isEdit = Boolean(exam);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExamFormValues>({
        resolver: zodResolver(examSchema),
        defaultValues: {
            name: "",
            type: EXAM_TYPE_LIST[0],
            classId: "",
            subjectId: "",
            totalMarks: 100,
            date: "",
        },
    });

    const classId = useWatch({ control, name: "classId" });

    const selectedClass = useMemo(
        () => classes.find((item) => item.id === classId) ?? null,
        [classes, classId],
    );

    const { data: subjects = [] } = useSubjectsList({ gradeLevel: selectedClass?.gradeLevel });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            name: exam?.name ?? "",
            type: exam?.type ?? EXAM_TYPE_LIST[0],
            classId: exam?.classId ?? "",
            subjectId: exam?.subjectId ?? "",
            totalMarks: exam?.totalMarks ?? 100,
            date: toDateInputValue(exam?.date ?? ""),
        });
    }, [open, exam, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit exam" : "Create exam"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the exam details. Class and subject cannot be changed."
                            : "Schedule an exam for a class and subject."}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Unit Test 1" {...register("name")} />
                        {errors.name && (
                            <p className="text-destructive text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger aria-label="Exam type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EXAM_TYPE_LIST.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {EXAM_TYPE_LABELS[type]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.type && (
                                <p className="text-destructive text-xs">{errors.type.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalMarks">Total marks</Label>
                            <Input
                                id="totalMarks"
                                type="number"
                                {...register("totalMarks", { valueAsNumber: true })}
                            />
                            {errors.totalMarks && (
                                <p className="text-destructive text-xs">
                                    {errors.totalMarks.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Class</Label>
                            <Controller
                                control={control}
                                name="classId"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isEdit}
                                    >
                                        <SelectTrigger aria-label="Class">
                                            <SelectValue placeholder="Select class" />
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
                            <Label>Subject</Label>
                            <Controller
                                control={control}
                                name="subjectId"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isEdit || !selectedClass}
                                    >
                                        <SelectTrigger aria-label="Subject">
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({item.code})
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" {...register("date")} />
                        {errors.date && (
                            <p className="text-destructive text-xs">{errors.date.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isEdit ? "Save changes" : "Create exam"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
