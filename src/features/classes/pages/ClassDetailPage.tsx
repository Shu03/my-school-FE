import { useState, type JSX } from "react";

import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertCircle,
    ArrowLeft,
    CalendarRange,
    Check,
    Pencil,
    School,
    Users,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ClassStudentsSection } from "../components/ClassStudentsSection";
import { ClassSubjectsSection } from "../components/ClassSubjectsSection";
import { ClassTeacherSection } from "../components/ClassTeacherSection";
import { useClass, useUpdateClass } from "../hooks/useClasses";
import { getClassErrorMessage } from "../lib/errors";
import { editSectionSchema, type EditSectionFormValues } from "../schemas/class.schema";

export function ClassDetailPage(): JSX.Element {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const canManage = user?.role === Role.ADMIN;
    const [isEditing, setIsEditing] = useState(false);

    const { data: schoolClass, isLoading, isError } = useClass(id || null);
    const updateSectionMutation = useUpdateClass();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditSectionFormValues>({
        resolver: zodResolver(editSectionSchema),
        defaultValues: { name: "" },
    });

    async function handleEdit(values: EditSectionFormValues): Promise<void> {
        try {
            await updateSectionMutation.mutateAsync({ id, data: { name: values.name } });
            toast.success("Section name updated successfully.");
            setIsEditing(false);
        } catch (error) {
            toast.error(getClassErrorMessage(error));
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Spinner />
            </div>
        );
    }

    if (isError || !schoolClass) {
        return (
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={() => navigate(ROUTES.CLASSES)}
                >
                    <ArrowLeft className="size-4" />
                    Back to classes
                </Button>
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>
                        Could not load this Section. Please try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground -ml-2 self-start"
                    onClick={() =>
                        navigate(ROUTES.CLASSES, {
                            state: {
                                academicYearId: schoolClass.academicYearId,
                            },
                        })
                    }
                >
                    <ArrowLeft className="size-4" />
                    Back to Class {schoolClass.gradeLevel}
                </Button>

                <div className="border-border/60 flex flex-wrap items-center gap-4 border-b pb-5">
                    <div className="texture-sheen bg-primary/12 text-primary ring-primary/25 flex size-12 shrink-0 items-center justify-center rounded-xl ring-1">
                        <School className="size-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Class {schoolClass.gradeLevel}
                        </p>
                        {isEditing ? (
                            <form
                                className="mt-1 flex flex-wrap items-start gap-2"
                                onSubmit={handleSubmit(handleEdit)}
                                noValidate
                            >
                                <div>
                                    <Input
                                        autoFocus
                                        aria-label="Section name"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={
                                            errors.name ? "section-name-error" : undefined
                                        }
                                        className="h-9 w-52 text-base font-semibold"
                                        {...register("name")}
                                    />
                                    {errors.name ? (
                                        <p
                                            id="section-name-error"
                                            role="alert"
                                            className="text-destructive mt-1 text-xs"
                                        >
                                            {errors.name.message}
                                        </p>
                                    ) : null}
                                </div>
                                <Button
                                    type="submit"
                                    size="icon-lg"
                                    aria-label="Save Section name"
                                    disabled={updateSectionMutation.isPending}
                                >
                                    {updateSectionMutation.isPending ? <Spinner /> : <Check />}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-lg"
                                    aria-label="Cancel editing"
                                    disabled={updateSectionMutation.isPending}
                                    onClick={() => setIsEditing(false)}
                                >
                                    <X />
                                </Button>
                            </form>
                        ) : (
                            <h1 className="truncate text-2xl font-bold tracking-tight">
                                Section {schoolClass.name}
                            </h1>
                        )}
                        <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                            <CalendarRange className="size-4 shrink-0" />
                            <span className="truncate">{schoolClass.academicYear.name}</span>
                        </p>
                    </div>
                    {canManage && !isEditing ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="ml-auto"
                            onClick={() => {
                                reset({ name: schoolClass.name });
                                setIsEditing(true);
                            }}
                        >
                            <Pencil />
                            Rename Section
                        </Button>
                    ) : null}
                </div>
            </div>

            <Tabs defaultValue="staffing">
                <TabsList className="h-10 w-full sm:w-auto">
                    <TabsTrigger value="staffing">
                        <School />
                        Staffing
                    </TabsTrigger>
                    <TabsTrigger value="students">
                        <Users />
                        Students
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="staffing" className="mt-5">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <ClassTeacherSection
                            classId={schoolClass.id}
                            classTeacher={schoolClass.classTeacher}
                            canManage={canManage}
                        />
                        <ClassSubjectsSection
                            classId={schoolClass.id}
                            gradeLevel={schoolClass.gradeLevel}
                            canManage={canManage}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="students" className="mt-5">
                    <ClassStudentsSection
                        classId={schoolClass.id}
                        academicYearId={schoolClass.academicYearId}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
