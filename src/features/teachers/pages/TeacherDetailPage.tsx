import { useState } from "react";
import type { JSX } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { AlertCircle, ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";

import type { Permission } from "@constants/permissions.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { AssignmentFormDialog } from "../components/AssignmentFormDialog";
import { TeacherAssignmentsSection } from "../components/TeacherAssignmentsSection";
import { TeacherPermissionsCard } from "../components/TeacherPermissionsCard";
import { TeacherProfileDialog } from "../components/TeacherProfileDialog";
import {
    useAssignPreset,
    useCreateAssignment,
    useDeleteAssignment,
    usePresetsList,
    useRemovePreset,
    useReplaceOverrides,
    useTeacher,
    useTeacherAssignments,
    useUpdateTeacher,
} from "../hooks/useTeachers";
import { getAssignmentErrorMessage, getTeacherErrorMessage } from "../lib/errors";
import type { AssignmentFormValues, TeacherProfileFormValues } from "../schemas/teacher.schema";
import type { TeacherAssignment } from "../types/teacher.types";

export function TeacherDetailPage(): JSX.Element {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const isAdmin = user?.role === Role.ADMIN;
    const isOwnProfile = user?.role === Role.TEACHER && user.teacherProfileId === id;
    const canView = isAdmin || isOwnProfile;
    const canManage = isAdmin;

    const [profileOpen, setProfileOpen] = useState(false);
    const [assignmentOpen, setAssignmentOpen] = useState(false);

    const { data: teacher, isLoading, isError } = useTeacher(canView ? id : null);
    const { data: assignments = [], isLoading: assignmentsLoading } = useTeacherAssignments(
        canView ? id : null,
    );
    const { data: presets = [] } = usePresetsList(canManage);

    const updateTeacherMutation = useUpdateTeacher();
    const assignPresetMutation = useAssignPreset();
    const removePresetMutation = useRemovePreset();
    const replaceOverridesMutation = useReplaceOverrides();
    const createAssignmentMutation = useCreateAssignment();
    const deleteAssignmentMutation = useDeleteAssignment();

    async function handleProfileSubmit(values: TeacherProfileFormValues): Promise<void> {
        try {
            await updateTeacherMutation.mutateAsync({
                id,
                data: {
                    employeeCode: values.employeeCode,
                    joiningDate: values.joiningDate || undefined,
                },
            });
            toast.success("Profile updated successfully.");
            setProfileOpen(false);
        } catch (error) {
            toast.error(getTeacherErrorMessage(error));
        }
    }

    function handleAssignPreset(presetId: string): void {
        assignPresetMutation.mutate(
            { id, presetId },
            {
                onSuccess: () => toast.success("Preset assigned successfully."),
                onError: (error) => toast.error(getTeacherErrorMessage(error)),
            },
        );
    }

    function handleRemovePreset(): void {
        removePresetMutation.mutate(
            { id },
            {
                onSuccess: () => toast.success("Preset removed successfully."),
                onError: (error) => toast.error(getTeacherErrorMessage(error)),
            },
        );
    }

    function handleSaveOverrides(permissions: Permission[]): void {
        replaceOverridesMutation.mutate(
            { id, data: { permissionOverrides: permissions } },
            {
                onSuccess: () => toast.success("Permission overrides saved."),
                onError: (error) => toast.error(getTeacherErrorMessage(error)),
            },
        );
    }

    async function handleAssignmentSubmit(values: AssignmentFormValues): Promise<void> {
        try {
            await createAssignmentMutation.mutateAsync({ id, data: values });
            toast.success("Assignment added successfully.");
            setAssignmentOpen(false);
        } catch (error) {
            toast.error(getAssignmentErrorMessage(error));
        }
    }

    async function handleDeleteAssignment(assignment: TeacherAssignment): Promise<void> {
        const confirmed = window.confirm("Delete this assignment? This action cannot be undone.");
        if (!confirmed) {
            return;
        }

        try {
            await deleteAssignmentMutation.mutateAsync({ id, assignmentId: assignment.id });
            toast.success("Assignment deleted successfully.");
        } catch (error) {
            toast.error(getAssignmentErrorMessage(error));
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
                <span className="text-muted-foreground text-sm">Loading teacher...</span>
            </div>
        );
    }

    if (isError || !teacher) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>The requested teacher was not found.</AlertDescription>
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
                    onClick={() => navigate(ROUTES.TEACHERS)}
                >
                    <ArrowLeft className="size-4" />
                    Back to teachers
                </Button>
            )}

            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            {teacher.user.firstName} {teacher.user.lastName}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {teacher.employeeCode}
                            {teacher.joiningDate && ` · Joined ${teacher.joiningDate.slice(0, 10)}`}
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
                    <div>Mobile: {teacher.user.mobileNumber}</div>
                    {teacher.user.email && <div>Email: {teacher.user.email}</div>}
                </CardContent>
            </Card>

            <TeacherPermissionsCard
                teacher={teacher}
                presets={presets}
                canManage={canManage}
                isAssigningPreset={assignPresetMutation.isPending}
                isRemovingPreset={removePresetMutation.isPending}
                isSavingOverrides={replaceOverridesMutation.isPending}
                onAssignPreset={handleAssignPreset}
                onRemovePreset={handleRemovePreset}
                onSaveOverrides={handleSaveOverrides}
            />

            <TeacherAssignmentsSection
                assignments={assignments}
                isLoading={assignmentsLoading}
                canManage={canManage}
                deletingAssignmentId={
                    deleteAssignmentMutation.isPending
                        ? (deleteAssignmentMutation.variables?.assignmentId ?? null)
                        : null
                }
                onAdd={() => setAssignmentOpen(true)}
                onDelete={(assignment) => void handleDeleteAssignment(assignment)}
            />

            {canManage && (
                <>
                    <TeacherProfileDialog
                        open={profileOpen}
                        teacher={teacher}
                        isSubmitting={updateTeacherMutation.isPending}
                        onOpenChange={setProfileOpen}
                        onSubmit={handleProfileSubmit}
                    />
                    <AssignmentFormDialog
                        open={assignmentOpen}
                        isSubmitting={createAssignmentMutation.isPending}
                        onOpenChange={setAssignmentOpen}
                        onSubmit={handleAssignmentSubmit}
                    />
                </>
            )}
        </div>
    );
}
