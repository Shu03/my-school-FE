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

import { toDateInputValue } from "../lib/format";
import { updateStudentSchema, type UpdateStudentFormValues } from "../schemas/student.schema";
import type { StudentProfile } from "../types/student.types";

interface StudentProfileDialogProps {
    open: boolean;
    student: StudentProfile | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: UpdateStudentFormValues) => Promise<void>;
}

export function StudentProfileDialog({
    open,
    student,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: StudentProfileDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdateStudentFormValues>({
        resolver: zodResolver(updateStudentSchema),
        defaultValues: { admissionNumber: "", dateOfBirth: "" },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            admissionNumber: student?.admissionNumber ?? "",
            dateOfBirth: toDateInputValue(student?.dateOfBirth ?? null),
        });
    }, [open, student, reset]);

    async function handleFormSubmit(values: UpdateStudentFormValues): Promise<void> {
        await onSubmit({
            admissionNumber: values.admissionNumber?.trim() || undefined,
            dateOfBirth: values.dateOfBirth || undefined,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit student</DialogTitle>
                    <DialogDescription>
                        Update the admission number or date of birth.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="admissionNumber">Admission number</Label>
                        <Input id="admissionNumber" {...register("admissionNumber")} />
                        {errors.admissionNumber && (
                            <p className="text-destructive text-xs">
                                {errors.admissionNumber.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of birth</Label>
                        <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                        {errors.dateOfBirth && (
                            <p className="text-destructive text-xs">{errors.dateOfBirth.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
