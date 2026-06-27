import { useState } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    CalendarRange,
    Check,
    GraduationCap,
    Pencil,
    UserPlus,
    UserRound,
    UserRoundX,
    X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { teacherInitials } from "../lib/format";
import { editClassSchema, type EditClassFormValues } from "../schemas/class.schema";
import type { SchoolClass, TeacherOption } from "../types/class.types";

interface ClassCardProps {
    schoolClass: SchoolClass;
    yearName: string;
    teacherName: string | null;
    teacherOptions: TeacherOption[];
    isTeachersLoading: boolean;
    teacherLoadError: boolean;
    isUpdating: boolean;
    isAssigning: boolean;
    isRemoving: boolean;
    onUpdate: (id: string, data: { name: string; gradeLevel: number }) => Promise<boolean>;
    onAssignTeacher: (id: string, teacherId: string) => Promise<boolean>;
    onRemoveTeacher: (id: string) => Promise<boolean>;
}

export function ClassCard({
    schoolClass,
    yearName,
    teacherName,
    teacherOptions,
    isTeachersLoading,
    teacherLoadError,
    isUpdating,
    isAssigning,
    isRemoving,
    onUpdate,
    onAssignTeacher,
    onRemoveTeacher,
}: ClassCardProps): JSX.Element {
    const reduceMotion = useReducedMotion();
    const [isEditing, setIsEditing] = useState(false);
    const [pendingTeacherId, setPendingTeacherId] = useState("");

    const swap = reduceMotion
        ? {}
        : {
              initial: { opacity: 0, y: 6 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -6 },
              transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
          };

    async function handleAssign(): Promise<void> {
        if (!pendingTeacherId) {
            return;
        }

        const success = await onAssignTeacher(schoolClass.id, pendingTeacherId);
        if (success) {
            setPendingTeacherId("");
        }
    }

    const total = schoolClass.studentCount;
    const boys = schoolClass.boysCount;
    const girls = schoolClass.girlsCount;
    const hasSplit = boys !== undefined && girls !== undefined && boys + girls > 0;
    const splitTotal = boys !== undefined && girls !== undefined ? boys + girls : 0;
    const boysPct = boys !== undefined && splitTotal > 0 ? (boys / splitTotal) * 100 : 0;
    const girlsPct = hasSplit ? 100 - boysPct : 0;
    const displayTotal = total ?? (hasSplit ? splitTotal : undefined);

    return (
        <Card
            className={cn(
                "relative gap-0 overflow-hidden py-0 transition-shadow",
                isEditing && "ring-primary/40 ring-2",
            )}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isEditing ? (
                    <motion.div key="edit" {...swap}>
                        <ClassEditForm
                            schoolClass={schoolClass}
                            yearName={yearName}
                            isUpdating={isUpdating}
                            onCancel={() => setIsEditing(false)}
                            onSave={async (data) => {
                                const success = await onUpdate(schoolClass.id, data);
                                if (success) {
                                    setIsEditing(false);
                                }
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="view" {...swap} className="flex flex-col">
                        <div className="border-border/60 relative overflow-hidden border-b px-5 py-4">
                            <div className="from-primary/8 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent to-transparent" />
                            <div className="relative flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <span className="bg-primary/12 text-primary ring-primary/25 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1">
                                        <GraduationCap className="size-3" />
                                        Grade {schoolClass.gradeLevel}
                                    </span>
                                    <h3 className="mt-2 truncate text-xl font-bold tracking-tight">
                                        {schoolClass.name}
                                    </h3>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                                        <CalendarRange className="size-3.5 shrink-0" />
                                        <span className="truncate">{yearName || "—"}</span>
                                    </p>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="-mt-1 -mr-1 shrink-0"
                                            aria-label={`Edit ${schoolClass.name}`}
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit class</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        <CardContent className="flex flex-col gap-4 px-5 py-4">
                            <section className="flex flex-col">
                                <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
                                    Enrollment
                                </p>
                                <div className="mt-2.5 flex items-baseline gap-1.5">
                                    <span
                                        className={cn(
                                            "text-3xl leading-none font-bold tabular-nums",
                                            displayTotal === undefined &&
                                                "text-muted-foreground/40",
                                        )}
                                    >
                                        {displayTotal ?? "—"}
                                    </span>
                                    <span className="text-muted-foreground text-sm font-medium">
                                        students
                                    </span>
                                </div>
                                {hasSplit ? (
                                    <>
                                        <div className="bg-muted mt-3 flex h-2.5 overflow-hidden rounded-full">
                                            <div
                                                className="bg-chart-2"
                                                style={{ width: `${boysPct}%` }}
                                            />
                                            <div
                                                className="bg-chart-4"
                                                style={{ width: `${girlsPct}%` }}
                                            />
                                        </div>
                                        <div className="mt-2.5 flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-1.5">
                                                <span className="bg-chart-2 size-2 rounded-full" />
                                                <span className="text-muted-foreground">Boys</span>
                                                <span className="font-semibold tabular-nums">
                                                    {schoolClass.boysCount}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="font-semibold tabular-nums">
                                                    {schoolClass.girlsCount}
                                                </span>
                                                <span className="text-muted-foreground">Girls</span>
                                                <span className="bg-chart-4 size-2 rounded-full" />
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-muted/70 mt-3 h-2.5 rounded-full" />
                                        <p className="text-muted-foreground/70 mt-2.5 text-xs">
                                            Enrollment breakdown not available yet
                                        </p>
                                    </>
                                )}
                            </section>

                            <div className="bg-border/60 h-px" />

                            {teacherName ? (
                                <div className="border-border/60 bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-3">
                                    <span className="bg-primary/10 text-primary texture-sheen flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                        {teacherInitials(teacherName)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
                                            Class teacher
                                        </p>
                                        <p className="truncate text-sm font-medium">
                                            {teacherName}
                                        </p>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive ml-auto"
                                                aria-label={`Unassign teacher from ${schoolClass.name}`}
                                                disabled={isRemoving}
                                                onClick={() => void onRemoveTeacher(schoolClass.id)}
                                            >
                                                {isRemoving ? (
                                                    <Spinner className="size-4" />
                                                ) : (
                                                    <UserRoundX className="size-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Unassign teacher</TooltipContent>
                                    </Tooltip>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <p className="text-muted-foreground flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide uppercase">
                                        <UserRound className="size-3.5" />
                                        Assign class teacher
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={pendingTeacherId}
                                            onValueChange={setPendingTeacherId}
                                            disabled={teacherLoadError || isAssigning}
                                        >
                                            <SelectTrigger
                                                className="flex-1"
                                                aria-label="Select class teacher"
                                            >
                                                <SelectValue placeholder="Select a teacher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isTeachersLoading ? (
                                                    <div className="text-muted-foreground px-2 py-1.5 text-sm">
                                                        Loading teachers...
                                                    </div>
                                                ) : (
                                                    teacherOptions.map((teacher) => (
                                                        <SelectItem
                                                            key={teacher.id}
                                                            value={teacher.id}
                                                        >
                                                            {teacher.label}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="icon"
                                                    aria-label={`Assign teacher to ${schoolClass.name}`}
                                                    disabled={
                                                        !pendingTeacherId ||
                                                        isAssigning ||
                                                        teacherLoadError
                                                    }
                                                    onClick={() => void handleAssign()}
                                                >
                                                    {isAssigning ? (
                                                        <Spinner className="size-4" />
                                                    ) : (
                                                        <UserPlus className="size-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Assign teacher</TooltipContent>
                                        </Tooltip>
                                    </div>
                                    {teacherLoadError && (
                                        <p className="text-muted-foreground text-xs">
                                            Teacher list is unavailable right now.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

interface ClassEditFormProps {
    schoolClass: SchoolClass;
    yearName: string;
    isUpdating: boolean;
    onCancel: () => void;
    onSave: (data: { name: string; gradeLevel: number }) => Promise<void>;
}

function ClassEditForm({
    schoolClass,
    yearName,
    isUpdating,
    onCancel,
    onSave,
}: ClassEditFormProps): JSX.Element {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EditClassFormValues>({
        resolver: zodResolver(editClassSchema),
        defaultValues: {
            name: schoolClass.name,
            gradeLevel: schoolClass.gradeLevel,
        },
    });

    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(event) => void handleSubmit(onSave)(event)}
            noValidate
        >
            <CardHeader className="px-5 pt-5">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Editing class
                    </p>
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <CalendarRange className="size-3.5" />
                        {yearName || "—"}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-5 pb-5">
                <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor={`grade-${schoolClass.id}`} className="text-xs">
                            Grade
                        </Label>
                        <Input
                            id={`grade-${schoolClass.id}`}
                            type="number"
                            min={1}
                            max={99}
                            className="w-20"
                            {...register("gradeLevel", { valueAsNumber: true })}
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                        <Label htmlFor={`name-${schoolClass.id}`} className="text-xs">
                            Class name
                        </Label>
                        <Input
                            id={`name-${schoolClass.id}`}
                            placeholder="6A"
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
                        disabled={isUpdating}
                        onClick={onCancel}
                    >
                        <X className="size-4" />
                        Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isUpdating}>
                        {isUpdating ? <Spinner className="size-4" /> : <Check className="size-4" />}
                        Save
                    </Button>
                </div>
            </CardContent>
        </form>
    );
}
