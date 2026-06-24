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

import {
    createAcademicYearSchema,
    type CreateAcademicYearFormValues,
} from "../schemas/academic-year.schema";
import type { AcademicYear } from "../types/academic-year.types";

interface AcademicYearFormDialogProps {
    open: boolean;
    year: AcademicYear | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateAcademicYearFormValues) => Promise<void>;
}

export function AcademicYearFormDialog({
    open,
    year,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: AcademicYearFormDialogProps): JSX.Element {
    const isEdit = Boolean(year);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateAcademicYearFormValues>({
        resolver: zodResolver(createAcademicYearSchema),
        defaultValues: {
            name: "",
            startDate: "",
            endDate: "",
            copyClassStructureFromCurrent: false,
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            name: year?.name ?? "",
            startDate: year?.startDate.slice(0, 10) ?? "",
            endDate: year?.endDate.slice(0, 10) ?? "",
            copyClassStructureFromCurrent: false,
        });
    }, [open, year, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit academic year" : "Create academic year"}
                    </DialogTitle>
                    <DialogDescription>
                        Set the year range and optionally copy class structure.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="2026-27" {...register("name")} />
                        {errors.name && (
                            <p className="text-destructive text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start date</Label>
                            <Input id="startDate" type="date" {...register("startDate")} />
                            {errors.startDate && (
                                <p className="text-destructive text-xs">
                                    {errors.startDate.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End date</Label>
                            <Input id="endDate" type="date" {...register("endDate")} />
                            {errors.endDate && (
                                <p className="text-destructive text-xs">{errors.endDate.message}</p>
                            )}
                        </div>
                    </div>

                    {!isEdit && (
                        <label className="flex items-center gap-2 text-sm">
                            <Input
                                type="checkbox"
                                className="size-4"
                                {...register("copyClassStructureFromCurrent")}
                            />
                            Copy class structure from current year
                        </label>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isEdit ? "Save changes" : "Create year"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
