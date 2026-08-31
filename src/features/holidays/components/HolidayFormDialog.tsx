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
import { createHolidaySchema, type CreateHolidayFormValues } from "../schemas/holiday.schema";

interface HolidayFormDialogProps {
    open: boolean;
    yearName: string;
    yearStartDate: string;
    yearEndDate: string;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateHolidayFormValues) => Promise<void>;
}

export function HolidayFormDialog({
    open,
    yearName,
    yearStartDate,
    yearEndDate,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: HolidayFormDialogProps): JSX.Element {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<CreateHolidayFormValues>({
        resolver: zodResolver(createHolidaySchema),
        defaultValues: {
            name: "",
            date: "",
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({ name: "", date: "" });
    }, [open, reset]);

    async function handleFormSubmit(values: CreateHolidayFormValues): Promise<void> {
        if (values.date < yearStartDate.slice(0, 10) || values.date > yearEndDate.slice(0, 10)) {
            setError("date", {
                message: "Holiday date must be inside the academic year",
            });
            return;
        }

        await onSubmit(values);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add holiday</DialogTitle>
                    <DialogDescription>
                        Date must stay inside {yearName} ({toDateInputValue(yearStartDate)} to{" "}
                        {toDateInputValue(yearEndDate)}).
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">Holiday name</Label>
                        <Input id="name" placeholder="Independence Day" {...register("name")} />
                        {errors.name && (
                            <p className="text-destructive text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" {...register("date")} />
                        {errors.date && (
                            <p className="text-destructive text-xs">{errors.date.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            Add holiday
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
