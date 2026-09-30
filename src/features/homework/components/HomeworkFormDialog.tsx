import { useEffect, useMemo } from "react";
import type { JSX } from "react";

import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { NotebookPen } from "lucide-react";

import { HOMEWORK_VALIDATION } from "@constants/homework.constants";

import { formatSectionLabel } from "@lib/section";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useClassesList } from "@features/classes";
import type { SchoolClass } from "@features/classes";
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
import { cn } from "@/lib/utils";

import { toDateInputValue } from "../lib/format";
import { homeworkSchema, type HomeworkFormValues } from "../schemas/homework.schema";
import type { Homework } from "../types/homework.types";

interface HomeworkFormDialogProps {
    open: boolean;
    homework: Homework | null;
    isSubmitting: boolean;
    sections?: SchoolClass[];
    canChooseSubject?: (sectionId: string, subjectId: string) => boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: HomeworkFormValues) => Promise<void>;
}

export function HomeworkFormDialog({
    open,
    homework,
    isSubmitting,
    sections: allowedSections,
    canChooseSubject,
    onOpenChange,
    onSubmit,
}: HomeworkFormDialogProps): JSX.Element {
    const isEdit = Boolean(homework);

    const { data: currentYear } = useCurrentAcademicYear();
    const {
        control,
        register,
        handleSubmit,
        // watch,
        reset,
        formState: { errors },
    } = useForm<HomeworkFormValues>({
        resolver: zodResolver(homeworkSchema),
        defaultValues: { title: "", description: "", sectionId: "", subjectId: "", dueDate: "" },
    });

    const sectionId = useWatch({ control, name: "sectionId" });
    const descriptionLength = useWatch({ control, name: "description" })?.length ?? 0;
    const isNearDescriptionLimit = descriptionLength >= HOMEWORK_VALIDATION.DESCRIPTION_MAX * 0.9;
    const { data: loadedClasses = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );
    const classes = allowedSections ?? loadedClasses;

    const selectedClass = useMemo(
        () => classes.find((item) => item.id === sectionId) ?? null,
        [classes, sectionId],
    );

    const { data: loadedSubjects = [] } = useSubjectsList({
        classLevel: selectedClass?.classLevel,
    });
    const subjects = loadedSubjects.filter(
        (subject) => !sectionId || !canChooseSubject || canChooseSubject(sectionId, subject.id),
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            title: homework?.title ?? "",
            description: homework?.description ?? "",
            sectionId: homework?.sectionId ?? "",
            subjectId: homework?.subjectId ?? "",
            dueDate: toDateInputValue(homework?.dueDate ?? ""),
        });
    }, [open, homework, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
                <DialogHeader className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 pt-6 pb-5">
                    <div className="flex items-center gap-3">
                        <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                            <NotebookPen className="size-5" />
                        </span>
                        <div className="min-w-0 text-left">
                            <DialogTitle>
                                {isEdit ? "Edit homework" : "Assign homework"}
                            </DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? "Update the homework title, description, or due date."
                                    : "Assign homework to a class for a subject."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                className="h-10 text-base font-medium"
                                placeholder="Chapter 5 exercises"
                                {...register("title")}
                            />
                            {errors.title && (
                                <p className="text-destructive text-xs">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Class</Label>
                                <Controller
                                    control={control}
                                    name="sectionId"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isEdit}
                                        >
                                            <SelectTrigger
                                                className="w-full"
                                                aria-label="Select class"
                                            >
                                                <SelectValue placeholder="Select a class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {formatSectionLabel(
                                                            item.classLevel,
                                                            item.name,
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.sectionId && (
                                    <p className="text-destructive text-xs">
                                        {errors.sectionId.message}
                                    </p>
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
                                            <SelectTrigger
                                                className="w-full"
                                                aria-label="Select subject"
                                            >
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

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due date</Label>
                                <Input id="dueDate" type="date" {...register("dueDate")} />
                                {errors.dueDate && (
                                    <p className="text-destructive text-xs">
                                        {errors.dueDate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-end justify-between gap-3">
                                <Label htmlFor="description">Description</Label>
                                <span
                                    id="description-count"
                                    className={cn(
                                        "text-muted-foreground text-xs tabular-nums",
                                        isNearDescriptionLimit && "text-warning font-medium",
                                    )}
                                >
                                    {descriptionLength} / {HOMEWORK_VALIDATION.DESCRIPTION_MAX}
                                </span>
                            </div>
                            <Textarea
                                id="description"
                                maxLength={HOMEWORK_VALIDATION.DESCRIPTION_MAX}
                                aria-invalid={Boolean(errors.description)}
                                aria-describedby="description-count description-hint"
                                className="max-h-[50dvh] min-h-60 resize-none leading-relaxed md:text-[0.95rem]"
                                placeholder={
                                    "Complete questions 1 to 10 from the workbook.\nRead pages 42–48 before the next class.\nBring your science notebook."
                                }
                                {...register("description")}
                            />
                            {errors.description ? (
                                <p className="text-destructive text-xs">
                                    {errors.description.message}
                                </p>
                            ) : (
                                <p id="description-hint" className="text-muted-foreground text-xs">
                                    Line breaks are kept — put each task on its own line.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="bg-muted/40 border-border/60 m-0 border-t px-6 py-4">
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
