import type { JSX } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { AlertCircle, ArrowLeft, CalendarRange, GraduationCap } from "lucide-react";

import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { ClassStudentsSection } from "../components/ClassStudentsSection";
import { ClassSubjectsSection } from "../components/ClassSubjectsSection";
import { ClassTeacherSection } from "../components/ClassTeacherSection";
import { useClass } from "../hooks/useClasses";

export function ClassDetailPage(): JSX.Element {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const canManage = user?.role === Role.ADMIN;

    const { data: schoolClass, isLoading, isError } = useClass(id || null);

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
                        Could not load this class. Please try again.
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
                    onClick={() => navigate(ROUTES.CLASSES)}
                >
                    <ArrowLeft className="size-4" />
                    Back to classes
                </Button>

                <div className="border-border/60 relative overflow-hidden rounded-2xl border p-6">
                    <div className="from-primary/10 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent to-transparent" />
                    <div className="relative flex flex-wrap items-center gap-4">
                        <div className="bg-primary/12 text-primary flex size-14 shrink-0 items-center justify-center rounded-2xl">
                            <GraduationCap className="size-7" />
                        </div>
                        <div className="min-w-0">
                            <span className="bg-primary/12 text-primary ring-primary/25 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ring-1">
                                Grade {schoolClass.gradeLevel}
                            </span>
                            <h1 className="mt-1.5 truncate text-2xl font-bold tracking-tight">
                                {schoolClass.name}
                            </h1>
                            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                                <CalendarRange className="size-4 shrink-0" />
                                <span className="truncate">{schoolClass.academicYear.name}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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

            <ClassStudentsSection
                classId={schoolClass.id}
                academicYearId={schoolClass.academicYearId}
            />
        </div>
    );
}
