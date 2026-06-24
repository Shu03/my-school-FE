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
import { createTermSchema, type CreateTermFormValues } from "../schemas/academic-year.schema";
import type { AcademicYear, Term } from "../types/academic-year.types";

interface TermFormDialogProps {
    open: boolean;
    term: Term | null;
    year: AcademicYear;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateTermFormValues) => Promise<void>;
}

export function TermFormDialog({
    open,
    term,
    year,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: TermFormDialogProps): JSX.Element {
    const isEdit = Boolean(term);

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<CreateTermFormValues>({
        resolver: zodResolver(createTermSchema),
        defaultValues: {
            name: "",
            startDate: "",
            endDate: "",
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            name: term?.name ?? "",
            startDate: term?.startDate ? toDateInputValue(term.startDate) : "",
            endDate: term?.endDate ? toDateInputValue(term.endDate) : "",
        });
    }, [open, term, reset]);

    async function handleFormSubmit(values: CreateTermFormValues): Promise<void> {
        if (values.startDate < year.startDate.slice(0, 10)) {
            setError("startDate", {
                message: "Term start date must be inside the academic year",
            });
            return;
        }

        if (values.endDate > year.endDate.slice(0, 10)) {
            setError("endDate", {
                message: "Term end date must be inside the academic year",
            });
            return;
        }

        await onSubmit(values);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit term" : "Create term"}</DialogTitle>
                    <DialogDescription>
                        Range must stay inside {year.name} ({toDateInputValue(year.startDate)} to{" "}
                        {toDateInputValue(year.endDate)}).
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">Term name</Label>
                        <Input id="name" placeholder="Term 1" {...register("name")} />
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isEdit ? "Save changes" : "Create term"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
