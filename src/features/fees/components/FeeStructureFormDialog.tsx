import type { JSX } from "react";
import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { FEE_VALIDATION } from "@constants/fees.constants";

import { useAcademicYearsList, useCurrentAcademicYear } from "@features/academic-years";

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
import { feeStructureSchema, type FeeStructureFormValues } from "../schemas/fee-structure.schema";
import type { FeeStructure } from "../types/fee.types";

interface FeeStructureFormDialogProps {
    open: boolean;
    structure: FeeStructure | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: FeeStructureFormValues) => Promise<void>;
}

export function FeeStructureFormDialog({
    open,
    structure,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: FeeStructureFormDialogProps): JSX.Element {
    const isEdit = Boolean(structure);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: years = [] } = useAcademicYearsList();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FeeStructureFormValues>({
        resolver: zodResolver(feeStructureSchema),
        defaultValues: {
            gradeLevel: FEE_VALIDATION.GRADE_LEVEL_MIN,
            totalAmount: FEE_VALIDATION.TOTAL_AMOUNT_MIN,
            dueDate: "",
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            gradeLevel: structure?.gradeLevel ?? FEE_VALIDATION.GRADE_LEVEL_MIN,
            totalAmount: structure?.totalAmount ?? FEE_VALIDATION.TOTAL_AMOUNT_MIN,
            dueDate: toDateInputValue(structure?.dueDate ?? ""),
        });
    }, [open, structure, reset]);

    const yearName = structure
        ? (years.find((year) => year.id === structure.academicYearId)?.name ??
          structure.academicYear.name)
        : currentYear?.name;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit fee structure" : "Create fee structure"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the amount and due date. Grade level cannot be changed."
                            : "Define the fee amount for a grade in the current academic year."}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label>Academic year</Label>
                        <Input value={yearName ?? "-"} disabled readOnly />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gradeLevel">Grade level</Label>
                        <Controller
                            control={control}
                            name="gradeLevel"
                            render={({ field }) => (
                                <Input
                                    id="gradeLevel"
                                    type="number"
                                    value={field.value}
                                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                                    disabled={isEdit}
                                />
                            )}
                        />
                        {errors.gradeLevel && (
                            <p className="text-destructive text-xs">{errors.gradeLevel.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="totalAmount">Total amount</Label>
                        <Input
                            id="totalAmount"
                            type="number"
                            step="0.01"
                            {...register("totalAmount", { valueAsNumber: true })}
                        />
                        {errors.totalAmount && (
                            <p className="text-destructive text-xs">{errors.totalAmount.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due date</Label>
                        <Input id="dueDate" type="date" {...register("dueDate")} />
                        {errors.dueDate && (
                            <p className="text-destructive text-xs">{errors.dueDate.message}</p>
                        )}
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
                            {isEdit ? "Save changes" : "Create structure"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
