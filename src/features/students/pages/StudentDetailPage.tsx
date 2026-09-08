import { useMemo, useState } from "react";
import type { JSX } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    CalendarDays,
    GraduationCap,
    Mail,
    Pencil,
    Phone,
    School,
} from "lucide-react";
import { toast } from "sonner";

import { ATTENDANCE_STATUS } from "@constants/attendance.constants";
import { PERMISSIONS } from "@constants/permissions.constants";
import { attendancePage } from "@constants/routes.constants";
import { ENROLLMENT_STATUS } from "@constants/students.constants";

import { Role } from "@/types/api";

import { useAttendanceSummary, useStudentAttendance } from "@features/attendance";
import { hasPermission, useAuthStore } from "@features/auth";
import { StudentGradeHistoryCard } from "@features/grades";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { EnrollmentsSection } from "../components/EnrollmentsSection";
import { EnrollStudentDialog } from "../components/EnrollStudentDialog";
import { StudentProfileDialog } from "../components/StudentProfileDialog";
import { UpdateEnrollmentDialog } from "../components/UpdateEnrollmentDialog";
import {
    useEnrollStudent,
    useStudent,
    useUpdateEnrollment,
    useUpdateStudent,
} from "../hooks/useStudents";
import { getEnrollErrorMessage, getStudentErrorMessage } from "../lib/errors";
import { formatDate } from "../lib/format";
import type {
    EnrollStudentFormValues,
    UpdateEnrollmentFormValues,
    UpdateStudentFormValues,
} from "../schemas/student.schema";
import type { StudentEnrollment } from "../types/student.types";

interface AttendanceCardStats {
    totalDays: number;
    present: number;
    absent: number;
    percentage: number;
}

function getMonthBounds(month: string): { startDate: string; endDate: string } {
    const [yearText, monthText] = month.split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;

    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0));

    return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
    };
}

function summarizeOwnAttendance(
    statuses: Array<typeof ATTENDANCE_STATUS.PRESENT | typeof ATTENDANCE_STATUS.ABSENT>,
): AttendanceCardStats {
    const totalDays = statuses.length;
    const present = statuses.filter((status) => status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = statuses.filter((status) => status === ATTENDANCE_STATUS.ABSENT).length;

    return {
        totalDays,
        present,
        absent,
        percentage: totalDays > 0 ? Math.round((present / totalDays) * 100) : 0,
    };
}

export function StudentDetailPage(): JSX.Element {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const isAdmin = user?.role === Role.ADMIN;
    const isOwnProfile = user?.role === Role.STUDENT && user.studentProfileId === id;
    const canView = isAdmin || isOwnProfile || user?.role === Role.TEACHER;
    const canManage = isAdmin;
    const canViewGrades =
        isAdmin ||
        isOwnProfile ||
        (user?.role === Role.TEACHER && hasPermission(user.permissions, PERMISSIONS.GRADES_READ));

    const [profileOpen, setProfileOpen] = useState(false);
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState<StudentEnrollment | null>(null);

    const { data: student, isLoading, isError } = useStudent(canView ? id : null);

    const updateStudentMutation = useUpdateStudent();
    const enrollStudentMutation = useEnrollStudent();
    const updateEnrollmentMutation = useUpdateEnrollment();

    async function handleProfileSubmit(values: UpdateStudentFormValues): Promise<void> {
        try {
            await updateStudentMutation.mutateAsync({ id, data: values });
            toast.success("Student updated successfully.");
            setProfileOpen(false);
        } catch (error) {
            toast.error(getStudentErrorMessage(error));
        }
    }

    async function handleEnrollSubmit(values: EnrollStudentFormValues): Promise<void> {
        try {
            await enrollStudentMutation.mutateAsync({ id, data: values });
            toast.success("Student enrolled successfully.");
            setEnrollOpen(false);
        } catch (error) {
            toast.error(getEnrollErrorMessage(error));
        }
    }

    async function handleEnrollmentSubmit(values: UpdateEnrollmentFormValues): Promise<void> {
        if (!editingEnrollment) {
            return;
        }

        try {
            await updateEnrollmentMutation.mutateAsync({
                id,
                enrollmentId: editingEnrollment.id,
                data: values,
            });
            toast.success("Enrollment updated successfully.");
            setEditingEnrollment(null);
        } catch (error) {
            toast.error(getStudentErrorMessage(error));
        }
    }

    const activeEnrollment =
        student?.enrollments.find((enrollment) => enrollment.status === ENROLLMENT_STATUS.ACTIVE) ??
        null;

    const month = new Date().toISOString().slice(0, 7);
    const { startDate, endDate } = getMonthBounds(month);

    const {
        data: classSummary = [],
        isLoading: classSummaryLoading,
        isError: classSummaryError,
    } = useAttendanceSummary(
        {
            sectionId: activeEnrollment?.sectionId ?? "",
            month,
        },
        Boolean(activeEnrollment),
    );

    const { data: ownAttendance = [], isLoading: ownAttendanceLoading } = useStudentAttendance(
        student?.id ?? null,
        {
            academicYearId: activeEnrollment?.academicYearId,
            startDate,
            endDate,
        },
        Boolean(activeEnrollment),
    );

    const ownStats = useMemo(() => {
        const fromSummary = classSummary.find((item) => item.studentId === student?.id);
        if (fromSummary) {
            return {
                totalDays: fromSummary.totalDays,
                present: fromSummary.present,
                absent: fromSummary.absent,
                percentage: fromSummary.percentage,
            };
        }

        return summarizeOwnAttendance(ownAttendance.map((record) => record.status));
    }, [classSummary, ownAttendance, student?.id]);

    const classStats = useMemo(() => {
        const totalStudents = classSummary.length;
        const totalDays = classSummary.reduce((sum, item) => sum + item.totalDays, 0);
        const totalPresent = classSummary.reduce((sum, item) => sum + item.present, 0);
        const totalAbsent = classSummary.reduce((sum, item) => sum + item.absent, 0);
        const averagePercentage =
            totalStudents > 0
                ? Math.round(
                      classSummary.reduce((sum, item) => sum + item.percentage, 0) / totalStudents,
                  )
                : 0;

        return {
            totalStudents,
            totalDays,
            totalPresent,
            totalAbsent,
            averagePercentage,
        };
    }, [classSummary]);

    if (!canView) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>You can only access your own data.</AlertDescription>
            </Alert>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading student...</span>
            </div>
        );
    }

    if (isError || !student) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>The requested student was not found.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {isAdmin && (
                <Button variant="ghost" size="sm" className="w-fit" onClick={() => navigate(-1)}>
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
            )}

            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-semibold ring-1">
                                {student.user.firstName[0]}
                                {student.user.lastName[0]}
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {student.user.firstName} {student.user.lastName}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        Admission #{student.admissionNumber}
                                    </Badge>
                                    {student.user.isActive ? (
                                        <Badge>Active</Badge>
                                    ) : (
                                        <Badge variant="destructive">Inactive</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        {canManage && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProfileOpen(true)}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 px-6 py-6 text-sm sm:grid-cols-2">
                    <div className="border-border/60 bg-muted/25 flex items-center gap-2 rounded-lg border px-3 py-2.5">
                        <Phone className="text-muted-foreground size-4" />
                        <div>
                            <p className="text-muted-foreground text-xs">Mobile</p>
                            <p className="font-medium">{student.user.mobileNumber}</p>
                        </div>
                    </div>
                    <div className="border-border/60 bg-muted/25 flex items-center gap-2 rounded-lg border px-3 py-2.5">
                        <Mail className="text-muted-foreground size-4" />
                        <div>
                            <p className="text-muted-foreground text-xs">Email</p>
                            <p className="font-medium">{student.user.email ?? "-"}</p>
                        </div>
                    </div>
                    <div className="border-border/60 bg-muted/25 flex items-center gap-2 rounded-lg border px-3 py-2.5">
                        <CalendarDays className="text-muted-foreground size-4" />
                        <div>
                            <p className="text-muted-foreground text-xs">Date of birth</p>
                            <p className="font-medium">
                                {student.dateOfBirth ? formatDate(student.dateOfBirth) : "-"}
                            </p>
                        </div>
                    </div>
                    <div className="border-border/60 bg-muted/25 flex items-center gap-2 rounded-lg border px-3 py-2.5">
                        <GraduationCap className="text-muted-foreground size-4" />
                        <div>
                            <p className="text-muted-foreground text-xs">Student ID</p>
                            <p className="font-medium">{student.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            <EnrollmentsSection
                enrollments={student.enrollments}
                isLoading={false}
                canManage={canManage}
                onEnroll={() => setEnrollOpen(true)}
                onEdit={setEditingEnrollment}
            />

            {activeEnrollment && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="gap-0">
                        <CardHeader className="border-border/60 from-primary/10 via-primary/5 border-b bg-linear-to-br to-transparent">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <School className="size-4" />
                                Student attendance summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {ownAttendanceLoading ? (
                                <div className="flex items-center justify-center gap-2 py-6">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading...
                                    </span>
                                </div>
                            ) : (
                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">
                                            Total days
                                        </dt>
                                        <dd className="text-lg font-semibold">
                                            {ownStats.totalDays}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">Present</dt>
                                        <dd className="text-lg font-semibold">
                                            {ownStats.present}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">Absent</dt>
                                        <dd className="text-lg font-semibold">{ownStats.absent}</dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">
                                            Attendance %
                                        </dt>
                                        <dd className="text-lg font-semibold">
                                            {ownStats.percentage}%
                                        </dd>
                                    </div>
                                </dl>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0">
                        <CardHeader className="border-border/60 from-primary/10 via-primary/5 border-b bg-linear-to-br to-transparent">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <School className="size-4" />
                                Class attendance summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {classSummaryLoading ? (
                                <div className="flex items-center justify-center gap-2 py-6">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading...
                                    </span>
                                </div>
                            ) : classSummaryError ? (
                                <p className="text-muted-foreground text-sm">
                                    Class summary is not available for your role.
                                </p>
                            ) : (
                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">Students</dt>
                                        <dd className="text-lg font-semibold">
                                            {classStats.totalStudents}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">
                                            Avg attendance
                                        </dt>
                                        <dd className="text-lg font-semibold">
                                            {classStats.averagePercentage}%
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">Present</dt>
                                        <dd className="text-lg font-semibold">
                                            {classStats.totalPresent}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">Absent</dt>
                                        <dd className="text-lg font-semibold">
                                            {classStats.totalAbsent}
                                        </dd>
                                    </div>
                                </dl>
                            )}

                            {(isAdmin || user?.role === Role.TEACHER) && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-between"
                                    onClick={() =>
                                        navigate(attendancePage("mark", activeEnrollment.sectionId))
                                    }
                                >
                                    Mark attendance for this class
                                    <ArrowRight className="size-4" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {canViewGrades && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Grades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StudentGradeHistoryCard studentId={id} />
                    </CardContent>
                </Card>
            )}

            {canManage && (
                <>
                    <StudentProfileDialog
                        open={profileOpen}
                        student={student}
                        isSubmitting={updateStudentMutation.isPending}
                        onOpenChange={setProfileOpen}
                        onSubmit={handleProfileSubmit}
                    />
                    <EnrollStudentDialog
                        open={enrollOpen}
                        isSubmitting={enrollStudentMutation.isPending}
                        onOpenChange={setEnrollOpen}
                        onSubmit={handleEnrollSubmit}
                    />
                    <UpdateEnrollmentDialog
                        open={editingEnrollment !== null}
                        enrollment={editingEnrollment}
                        isSubmitting={updateEnrollmentMutation.isPending}
                        onOpenChange={(open) => {
                            if (!open) {
                                setEditingEnrollment(null);
                            }
                        }}
                        onSubmit={handleEnrollmentSubmit}
                    />
                </>
            )}
        </div>
    );
}
