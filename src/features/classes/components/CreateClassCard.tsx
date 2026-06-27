import type { JSX } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Check, Plus, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { editClassSchema, type EditClassFormValues } from "../schemas/class.schema";

interface CreateClassCardProps {
    isCreating: boolean;
    academicYearId: string;
    academicYearName: string;
    canCreate: boolean;
    isSubmitting: boolean;
    onStart: () => void;
    onCancel: () => void;
    onSubmit: (values: {
        name: string;
        gradeLevel: number;
        academicYearId: string;
    }) => Promise<boolean>;
}

export function CreateClassCard({
    isCreating,
    academicYearId,
    academicYearName,
    canCreate,
    isSubmitting,
    onStart,
    onCancel,
    onSubmit,
}: CreateClassCardProps): JSX.Element {
    const reduceMotion = useReducedMotion();

    const swap = reduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 6 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -6 },
              transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
          };

    return (
        <AnimatePresence mode="wait" initial={false}>
            {isCreating ? (
                <motion.div key="form" {...swap}>
                    <Card className="ring-primary/40 h-full gap-0 ring-2">
                        <CreateClassForm
                            academicYearId={academicYearId}
                            academicYearName={academicYearName}
                            isSubmitting={isSubmitting}
                            onCancel={onCancel}
                            onSubmit={onSubmit}
                        />
                    </Card>
                </motion.div>
            ) : (
                <motion.button
                    key="tile"
                    type="button"
                    disabled={!canCreate}
                    onClick={onStart}
                    {...swap}
                    whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                    className="group border-border/70 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 flex h-full min-h-60 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="bg-primary/10 text-primary group-hover:bg-primary/15 flex size-12 items-center justify-center rounded-2xl transition-colors duration-200">
                        <Plus className="size-6" />
                    </span>
                    <span className="text-sm font-medium">Add class</span>
                    {academicYearName && (
                        <span className="flex items-center gap-1 text-xs opacity-80">
                            <CalendarRange className="size-3.5" />
                            {academicYearName}
                        </span>
                    )}
                </motion.button>
            )}
        </AnimatePresence>
    );
}

interface CreateClassFormProps {
    academicYearId: string;
    academicYearName: string;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (values: {
        name: string;
        gradeLevel: number;
        academicYearId: string;
    }) => Promise<boolean>;
}

function CreateClassForm({
    academicYearId,
    academicYearName,
    isSubmitting,
    onCancel,
    onSubmit,
}: CreateClassFormProps): JSX.Element {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditClassFormValues>({
        resolver: zodResolver(editClassSchema),
        defaultValues: {
            name: "",
            gradeLevel: 1,
        },
    });

    async function submit(values: EditClassFormValues): Promise<void> {
        const success = await onSubmit({ ...values, academicYearId });
        if (success) {
            reset();
        }
    }

    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(event) => void handleSubmit(submit)(event)}
            noValidate
        >
            <CardHeader className="px-5 pt-5">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        New class
                    </p>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <CalendarRange className="size-3.5" />
                        {academicYearName || "—"}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5">
                <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="new-class-grade" className="text-xs">
                            Grade
                        </Label>
                        <Input
                            id="new-class-grade"
                            type="number"
                            min={1}
                            max={99}
                            className="w-20"
                            {...register("gradeLevel", { valueAsNumber: true })}
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                        <Label htmlFor="new-class-name" className="text-xs">
                            Class name
                        </Label>
                        <Input
                            id="new-class-name"
                            placeholder="6A"
                            autoFocus
                            {...register("name")}
                        />
                    </div>
                </div>
                {(errors.name ?? errors.gradeLevel) && (
                    <p className="text-destructive text-xs">
                        {errors.name?.message ?? errors.gradeLevel?.message}
                    </p>
                )}
                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSubmitting}
                        aria-label="Discard new class"
                        onClick={onCancel}
                    >
                        <X className="size-4" />
                        Discard
                    </Button>
                    <Button type="submit" size="sm" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Spinner className="size-4" />
                        ) : (
                            <Check className="size-4" />
                        )}
                        Create
                    </Button>
                </div>
            </CardContent>
        </form>
    );
}
