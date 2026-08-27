import { useEffect, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";

import { toDateInputValue } from "../lib/format";
import { homeworkSchema, type HomeworkFormValues } from "../schemas/homework.schema";
import type { Homework } from "../types/homework.types";

interface HomeworkFormDialogProps {
    open: boolean;
    homework: Homework | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: HomeworkFormValues) => Promise<void>;
}

export function HomeworkFormDialog({
    open,
    homework,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: HomeworkFormDialogProps): JSX.Element {
    const isEdit = Boolean(homework);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const {
        control,
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<HomeworkFormValues>({
        resolver: zodResolver(homeworkSchema),
        defaultValues: { title: "", description: "", classId: "", subjectId: "", dueDate: "" },
    });

    const classId = watch("classId");

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
            title: homework?.title ?? "",
            description: homework?.description ?? "",
            classId: homework?.classId ?? "",
            subjectId: homework?.subjectId ?? "",
            dueDate: toDateInputValue(homework?.dueDate ?? ""),
        });
    }, [open, homework, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit homework" : "Assign homework"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the homework title, description, or due date."
                            : "Assign homework to a class for a subject."}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Chapter 5 exercises"
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-destructive text-xs">{errors.title.message}</p>
                        )}
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due date</Label>
                        <Input id="dueDate" type="date" {...register("dueDate")} />
                        {errors.dueDate && (
                            <p className="text-destructive text-xs">{errors.dueDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            rows={5}
                            placeholder="Complete questions 1 to 10 from the workbook"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-destructive text-xs">{errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isEdit ? "Save changes" : "Assign homework"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
