import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, UserPlus, Users } from "lucide-react";

import { ROUTES } from "@constants/routes.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { TeacherDirectory } from "../components/TeacherDirectory";
import { useTeachersList } from "../hooks/useTeachers";
import { getTeacherErrorMessage } from "../lib/errors";
import type { TeacherProfile } from "../types/teacher.types";

export function TeachersPage(): JSX.Element {
    const navigate = useNavigate();

    const {
        data: teachers = [],
        error: teachersApiError,
        isLoading: teachersLoading,
        isError: teachersError,
        refetch: refetchTeachers,
    } = useTeachersList();
    function handleSelectTeacher(teacher: TeacherProfile): void {
        if (!teacher.user.isActive) return;
        navigate(`/teachers/${teacher.id}`);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 relative isolate overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="texture-sheen bg-primary/12 text-primary ring-primary/25 flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">Teachers</h1>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Manage faculty profiles and teaching assignments.
                                </p>
                            </div>
                        </div>
                        <Button onClick={() => navigate(`${ROUTES.USER_NEW}?role=TEACHER`)}>
                            <UserPlus />
                            Add teacher
                        </Button>
                    </div>
                </div>

                <div className="px-6 py-6">
                    {teachersError ? (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertDescription className="flex items-center justify-between gap-4">
                                        <span>{getTeacherErrorMessage(teachersApiError)}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => void refetchTeachers()}
                                        >
                                            Retry
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                    ) : (
                                <div className="min-w-0">
                                    <TeacherDirectory
                                        teachers={teachers}
                                        isLoading={teachersLoading}
                                        selectedTeacherId={null}
                                        onSelect={handleSelectTeacher}
                                    />
                                </div>
                    )}
                </div>
            </div>
        </div>
    );
}
