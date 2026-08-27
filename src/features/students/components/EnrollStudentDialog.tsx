import type { JSX } from "react";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useClassesList } from "@features/classes";

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

import { enrollStudentSchema, type EnrollStudentFormValues } from "../schemas/student.schema";

interface EnrollStudentDialogProps {
    open: boolean;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: EnrollStudentFormValues) => Promise<void>;
}

export function EnrollStudentDialog({
    open,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: EnrollStudentDialogProps): JSX.Element {
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
    } = useForm<EnrollStudentFormValues>({
        resolver: zodResolver(enrollStudentSchema),
        defaultValues: { classId: "", academicYearId: "", rollNumber: "" },
    });

    async function handleFormSubmit(values: EnrollStudentFormValues): Promise<void> {
        await onSubmit({
            classId: values.classId,
            academicYearId: currentYear?.id,
            rollNumber: values.rollNumber?.trim() || undefined,
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
                    <DialogTitle>Enroll student</DialogTitle>
                    <DialogDescription>
                        Enroll this student in a class for {currentYear?.name ?? "the current year"}
                        . Roll number is auto-generated if left blank.
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
                        <Label htmlFor="rollNumber">Roll number (optional)</Label>
                        <Input
                            id="rollNumber"
                            placeholder="Auto-generated"
                            {...register("rollNumber")}
                        />
                        {errors.rollNumber && (
                            <p className="text-destructive text-xs">{errors.rollNumber.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            Enroll
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
