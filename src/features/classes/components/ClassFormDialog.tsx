import { useEffect } from "react";
import type { JSX } from "react";

import { Controller, useForm } from "react-hook-form";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import { createClassSchema, type CreateClassFormValues } from "../schemas/class.schema";
import type { SchoolClass } from "../types/class.types";

interface AcademicYearOption {
    id: string;
    name: string;
}

interface ClassFormDialogProps {
    open: boolean;
    schoolClass: SchoolClass | null;
    academicYears: AcademicYearOption[];
    defaultAcademicYearId: string;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateClassFormValues) => Promise<void>;
}

export function ClassFormDialog({
    open,
    schoolClass,
    academicYears,
    defaultAcademicYearId,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: ClassFormDialogProps): JSX.Element {
    const isEdit = Boolean(schoolClass);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<CreateClassFormValues>({
        resolver: zodResolver(createClassSchema),
        defaultValues: {
            name: "",
            gradeLevel: 1,
            academicYearId: defaultAcademicYearId,
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            name: schoolClass?.name ?? "",
            gradeLevel: schoolClass?.gradeLevel ?? 1,
            academicYearId: schoolClass?.academicYearId ?? defaultAcademicYearId,
        });
    }, [defaultAcademicYearId, open, reset, schoolClass]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit class" : "Create class"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update class name and grade level."
                            : "Create a class for the selected academic year."}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">Class name</Label>
                        <Input id="name" placeholder="6A" {...register("name")} />
                        {errors.name && (
                            <p className="text-destructive text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gradeLevel">Grade level</Label>
                        <Input
                            id="gradeLevel"
                            type="number"
                            min={1}
                            max={99}
                            {...register("gradeLevel", { valueAsNumber: true })}
                        />
                        {errors.gradeLevel && (
                            <p className="text-destructive text-xs">{errors.gradeLevel.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="academicYearId">Academic year</Label>
                        <Controller
                            control={control}
                            name="academicYearId"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isEdit}
                                >
                                    <SelectTrigger
                                        id="academicYearId"
                                        aria-label="Select academic year"
                                    >
                                        <SelectValue placeholder="Select academic year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((year) => (
                                            <SelectItem key={year.id} value={year.id}>
                                                {year.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.academicYearId && (
                            <p className="text-destructive text-xs">
                                {errors.academicYearId.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isEdit ? "Save changes" : "Create class"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
