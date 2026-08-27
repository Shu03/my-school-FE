import { useEffect } from "react";
import type { JSX } from "react";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_LIST } from "@constants/students.constants";

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

import { updateEnrollmentSchema, type UpdateEnrollmentFormValues } from "../schemas/student.schema";
import type { StudentEnrollment } from "../types/student.types";

interface UpdateEnrollmentDialogProps {
    open: boolean;
    enrollment: StudentEnrollment | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: UpdateEnrollmentFormValues) => Promise<void>;
}

export function UpdateEnrollmentDialog({
    open,
    enrollment,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: UpdateEnrollmentDialogProps): JSX.Element {
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdateEnrollmentFormValues>({
        resolver: zodResolver(updateEnrollmentSchema),
        defaultValues: { status: undefined, rollNumber: "" },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            status: enrollment?.status,
            rollNumber: enrollment?.rollNumber ?? "",
        });
    }, [open, enrollment, reset]);

    async function handleFormSubmit(values: UpdateEnrollmentFormValues): Promise<void> {
        await onSubmit({
            status: values.status,
            rollNumber: values.rollNumber?.trim() || undefined,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update enrollment</DialogTitle>
                    <DialogDescription>
                        Change the enrollment status or roll number.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                    <SelectTrigger aria-label="Select status">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ENROLLMENT_STATUS_LIST.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {ENROLLMENT_STATUS_LABELS[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="enrollmentRollNumber">Roll number</Label>
                        <Input id="enrollmentRollNumber" {...register("rollNumber")} />
                        {errors.rollNumber && (
                            <p className="text-destructive text-xs">{errors.rollNumber.message}</p>
                        )}
                    </div>

                    {errors.status && (
                        <p className="text-destructive text-xs">{errors.status.message}</p>
                    )}

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
