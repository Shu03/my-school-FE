import { useState } from "react";
import type { JSX } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { AlertCircle, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

import { PERMISSIONS } from "@constants/permissions.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { hasPermission, useAuthStore } from "@features/auth";
import { StudentGradeHistoryCard } from "@features/grades";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={() => navigate(ROUTES.STUDENTS)}
                >
                    <ArrowLeft className="size-4" />
                    Back to students
                </Button>
            )}

            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {student.user.firstName} {student.user.lastName}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Admission #{student.admissionNumber}
                            {student.dateOfBirth && ` · Born ${formatDate(student.dateOfBirth)}`}
                        </p>
                    </div>
                    {canManage && (
                        <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
                            <Pencil className="size-4" />
                            Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="text-muted-foreground grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div>Mobile: {student.user.mobileNumber}</div>
                    {student.user.email && <div>Email: {student.user.email}</div>}
                </CardContent>
            </Card>

            <EnrollmentsSection
                enrollments={student.enrollments}
                isLoading={false}
                canManage={canManage}
                onEnroll={() => setEnrollOpen(true)}
                onEdit={setEditingEnrollment}
            />

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
