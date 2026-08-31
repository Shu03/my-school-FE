import { useEffect, useMemo } from "react";
import type { JSX } from "react";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

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
import { examSubjectSchema, type ExamSubjectFormValues } from "../schemas/exam.schema";
import type { ExamSubject } from "../types/exam.types";

interface ExamSubjectFormDialogProps {
    open: boolean;
    gradeLevel: number;
    excludeSubjectIds: string[];
    editing: ExamSubject | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ExamSubjectFormValues) => Promise<void>;
}

export function ExamSubjectFormDialog({
    open,
    gradeLevel,
    excludeSubjectIds,
    editing,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: ExamSubjectFormDialogProps): JSX.Element {
    const isEdit = Boolean(editing);

    const { data: subjects = [] } = useSubjectsList({ gradeLevel });

    const availableSubjects = useMemo(
        () => subjects.filter((subject) => !excludeSubjectIds.includes(subject.id)),
        [subjects, excludeSubjectIds],
    );

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExamSubjectFormValues>({
        resolver: zodResolver(examSubjectSchema),
        defaultValues: { subjectId: "", totalMarks: 100, date: "" },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            subjectId: editing?.subjectId ?? "",
            totalMarks: editing?.totalMarks ?? 100,
            date: toDateInputValue(editing?.date ?? ""),
        });
    }, [open, editing, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit subject" : "Add subject"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the marks or date for this subject."
                            : "Add a subject to this exam."}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Controller
                            control={control}
                            name="subjectId"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isEdit}
                                >
                                    <SelectTrigger aria-label="Subject">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isEdit && editing ? (
                                            <SelectItem value={editing.subjectId}>
                                                {editing.subject.name} ({editing.subject.code})
                                            </SelectItem>
                                        ) : (
                                            availableSubjects.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({item.code})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.subjectId && (
                            <p className="text-destructive text-xs">{errors.subjectId.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="subjectTotalMarks">Total marks</Label>
                            <Input
                                id="subjectTotalMarks"
                                type="number"
                                {...register("totalMarks", { valueAsNumber: true })}
                            />
                            {errors.totalMarks && (
                                <p className="text-destructive text-xs">
                                    {errors.totalMarks.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subjectDate">Date</Label>
                            <Input id="subjectDate" type="date" {...register("date")} />
                            {errors.date && (
                                <p className="text-destructive text-xs">{errors.date.message}</p>
                            )}
                        </div>
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
                            {isEdit ? "Save changes" : "Add subject"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
