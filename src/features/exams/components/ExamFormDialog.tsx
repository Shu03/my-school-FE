import { useEffect, useMemo } from "react";
import type { JSX } from "react";

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

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

import { examSchema, type ExamFormValues } from "../schemas/exam.schema";
import type { Exam } from "../types/exam.types";

interface ExamFormDialogProps {
    open: boolean;
    exam: Exam | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ExamFormValues) => Promise<void>;
}

const EMPTY_SUBJECT = { subjectId: "", totalMarks: 100, date: "" };

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
            subjects: [EMPTY_SUBJECT],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "subjects" });

    const classId = useWatch({ control, name: "classId" });

    const selectedClass = useMemo(
        () => classes.find((item) => item.id === classId) ?? null,
        [classes, classId],
    );

    const { data: subjects = [] } = useSubjectsList({ gradeLevel: selectedClass?.gradeLevel });

    const watchedSubjects = useWatch({ control, name: "subjects" });
    const selectedSubjectIds = (watchedSubjects ?? [])
        .map((row) => row?.subjectId)
        .filter((value): value is string => Boolean(value));
    const allSubjectsAdded = subjects.length > 0 && selectedSubjectIds.length >= subjects.length;

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            name: exam?.name ?? "",
            type: exam?.type ?? EXAM_TYPE_LIST[0],
            classId: exam?.classId ?? "",
            subjects: [EMPTY_SUBJECT],
        });
    }, [open, exam, reset]);

    const subjectsError =
        typeof errors.subjects?.message === "string" ? errors.subjects.message : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit exam" : "Create exam"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the exam name and type. Manage subjects from the exam detail page."
                            : "Schedule an exam for a class with one or more subjects."}
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
                    </div>

                    {!isEdit && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Subjects</Label>
                                    <p className="text-muted-foreground text-xs">
                                        {selectedClass
                                            ? `${fields.length} added`
                                            : "Select a class to add subjects"}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!selectedClass || allSubjectsAdded}
                                    onClick={() => append({ ...EMPTY_SUBJECT })}
                                >
                                    <Plus className="size-4" />
                                    Add subject
                                </Button>
                            </div>

                            {subjectsError && (
                                <p className="text-destructive text-xs">{subjectsError}</p>
                            )}

                            {!selectedClass ? (
                                <div className="border-border/60 text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
                                    Pick a class first, then add the subjects to be examined.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {fields.map((row, index) => {
                                        const currentValue = selectedSubjectIds[index];
                                        const availableSubjects = subjects.filter(
                                            (item) =>
                                                item.id === currentValue ||
                                                !selectedSubjectIds.includes(item.id),
                                        );

                                        return (
                                            <div
                                                key={row.id}
                                                className="bg-muted/30 border-border/60 rounded-lg border p-3"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-muted-foreground text-xs font-medium">
                                                        Subject {index + 1}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive size-7"
                                                        aria-label="Remove subject"
                                                        disabled={fields.length === 1}
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7rem_9rem] sm:items-end">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Subject</Label>
                                                        <Controller
                                                            control={control}
                                                            name={`subjects.${index}.subjectId`}
                                                            render={({ field }) => (
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger aria-label="Subject">
                                                                        <SelectValue placeholder="Select" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {availableSubjects.map(
                                                                            (item) => (
                                                                                <SelectItem
                                                                                    key={item.id}
                                                                                    value={item.id}
                                                                                >
                                                                                    {item.name} (
                                                                                    {item.code})
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.subjects?.[index]?.subjectId && (
                                                            <p className="text-destructive text-xs">
                                                                {
                                                                    errors.subjects[index]
                                                                        ?.subjectId?.message
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Marks</Label>
                                                        <Input
                                                            type="number"
                                                            aria-label="Total marks"
                                                            {...register(
                                                                `subjects.${index}.totalMarks`,
                                                                {
                                                                    valueAsNumber: true,
                                                                },
                                                            )}
                                                        />
                                                        {errors.subjects?.[index]?.totalMarks && (
                                                            <p className="text-destructive text-xs">
                                                                {
                                                                    errors.subjects[index]
                                                                        ?.totalMarks?.message
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Date</Label>
                                                        <Input
                                                            type="date"
                                                            aria-label="Date"
                                                            {...register(`subjects.${index}.date`)}
                                                        />
                                                        {errors.subjects?.[index]?.date && (
                                                            <p className="text-destructive text-xs">
                                                                {
                                                                    errors.subjects[index]?.date
                                                                        ?.message
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

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
