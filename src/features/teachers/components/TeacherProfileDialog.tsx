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

import { teacherProfileSchema, type TeacherProfileFormValues } from "../schemas/teacher.schema";
import type { TeacherProfile } from "../types/teacher.types";

interface TeacherProfileDialogProps {
    open: boolean;
    teacher: TeacherProfile;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: TeacherProfileFormValues) => Promise<void>;
}

export function TeacherProfileDialog({
    open,
    teacher,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: TeacherProfileDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TeacherProfileFormValues>({
        resolver: zodResolver(teacherProfileSchema),
        defaultValues: { employeeCode: "", joiningDate: "" },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            employeeCode: teacher.employeeCode,
            joiningDate: teacher.joiningDate?.slice(0, 10) ?? "",
        });
    }, [open, teacher, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit teacher profile</DialogTitle>
                    <DialogDescription>Update the employee code or joining date.</DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="employeeCode">Employee code</Label>
                        <Input
                            id="employeeCode"
                            aria-invalid={Boolean(errors.employeeCode)}
                            aria-describedby={
                                errors.employeeCode ? "employeeCode-error" : undefined
                            }
                            {...register("employeeCode")}
                        />
                        {errors.employeeCode && (
                            <p
                                id="employeeCode-error"
                                role="alert"
                                className="text-destructive text-xs"
                            >
                                {errors.employeeCode.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="joiningDate">Joining date</Label>
                        <Input id="joiningDate" type="date" {...register("joiningDate")} />
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
