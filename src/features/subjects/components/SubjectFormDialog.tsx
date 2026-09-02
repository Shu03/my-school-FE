import { useEffect } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

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
import { Spinner } from "@/components/ui/spinner";

import { createSubjectSchema, type CreateSubjectFormValues } from "../schemas/subject.schema";
import type { Subject } from "../types/subject.types";

interface SubjectFormDialogProps {
    open: boolean;
    subject: Subject | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateSubjectFormValues) => Promise<void>;
    fixedGradeLevel?: number;
}

export function SubjectFormDialog({
    open,
    subject,
    isSubmitting,
    onOpenChange,
    onSubmit,
    fixedGradeLevel,
}: SubjectFormDialogProps): JSX.Element {
    const isEdit = Boolean(subject);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateSubjectFormValues>({
        resolver: zodResolver(createSubjectSchema),
        defaultValues: { name: "", code: "", gradeLevel: 1, description: "" },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            name: subject?.name ?? "",
            code: subject?.code ?? "",
            gradeLevel: subject?.gradeLevel ?? fixedGradeLevel ?? 1,
            description: subject?.description ?? "",
        });
    }, [fixedGradeLevel, open, subject, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit subject" : "Create subject"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the subject name, code, or description."
                            : fixedGradeLevel
                              ? `Add a subject shared by every Section in Class ${fixedGradeLevel}.`
                              : "Add a subject for a specific class."}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Mathematics" {...register("name")} />
                        {errors.name && (
                            <p className="text-destructive text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input id="code" placeholder="MATH" {...register("code")} />
                            {errors.code && (
                                <p className="text-destructive text-xs">{errors.code.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gradeLevel">Class</Label>
                            <Input
                                id="gradeLevel"
                                type="number"
                                min={1}
                                max={99}
                                disabled={isEdit || fixedGradeLevel !== undefined}
                                {...register("gradeLevel", { valueAsNumber: true })}
                            />
                            {errors.gradeLevel && (
                                <p className="text-destructive text-xs">
                                    {errors.gradeLevel.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Optional description"
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
                            {isEdit ? "Save changes" : "Create subject"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
