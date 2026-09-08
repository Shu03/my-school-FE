import type { JSX } from "react";

import { ClipboardList, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import type { Permission } from "@constants/permissions.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    useAssignPreset,
    useRemovePreset,
    useReplaceOverrides,
    useTeacherAssignments,
} from "../hooks/useTeachers";
import { getTeacherErrorMessage } from "../lib/errors";
import type { PermissionPreset, TeacherProfile } from "../types/teacher.types";

import { TeacherAssignmentsSection } from "./TeacherAssignmentsSection";
import { TeacherPermissionsCard } from "./TeacherPermissionsCard";

interface TeacherInspectorProps {
    teacher: TeacherProfile | null;
    presets: PermissionPreset[];
    onOpenChange: (open: boolean) => void;
}

export function TeacherInspector({
    teacher,
    presets,
    onOpenChange,
}: TeacherInspectorProps): JSX.Element | null {
    const teacherId = teacher?.id ?? null;
    const {
        data: assignments = [],
        isLoading: assignmentsLoading,
        isError: assignmentsError,
        refetch: refetchAssignments,
    } = useTeacherAssignments(teacherId);
    const assignPresetMutation = useAssignPreset();
    const removePresetMutation = useRemovePreset();
    const replaceOverridesMutation = useReplaceOverrides();

    if (!teacher) {
        return null;
    }

    const selectedTeacher = teacher;
    const fullName = `${selectedTeacher.user.firstName} ${selectedTeacher.user.lastName}`;

    function handleAssignPreset(presetId: string): void {
        assignPresetMutation.mutate(
            { id: selectedTeacher.id, presetId },
            {
                onSuccess: () => toast.success("Preset assigned successfully."),
                onError: (error) => toast.error(getTeacherErrorMessage(error)),
            },
        );
    }

    function handleRemovePreset(): void {
        removePresetMutation.mutate(
            { id: selectedTeacher.id },
            {
                onSuccess: () => toast.success("Preset removed successfully."),
                onError: (error) => toast.error(getTeacherErrorMessage(error)),
            },
        );
    }

    function handleSaveOverrides(permissions: Permission[]): void {
        replaceOverridesMutation.mutate(
            { id: selectedTeacher.id, data: { permissionOverrides: permissions } },
            {
                onSuccess: () => toast.success("Permission additions saved."),
                onError: (error) => toast.error(getTeacherErrorMessage(error)),
            },
        );
    }

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{fullName}</DialogTitle>
                    <DialogDescription>
                        Manage permissions and assignments for {fullName}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="permissions" className="flex min-h-0 flex-1 flex-col">
                    <TabsList className="h-10 w-full">
                        <TabsTrigger value="permissions">
                            <ShieldCheck />
                            Permissions
                        </TabsTrigger>
                        <TabsTrigger value="assignments">
                            <ClipboardList />
                            Assignments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="permissions"
                        className="mt-4 min-h-0 flex-1 overflow-y-auto"
                    >
                        <TeacherPermissionsCard
                            key={teacher.id}
                            teacher={teacher}
                            presets={presets}
                            canManage
                            isAssigningPreset={assignPresetMutation.isPending}
                            isRemovingPreset={removePresetMutation.isPending}
                            isSavingOverrides={replaceOverridesMutation.isPending}
                            onAssignPreset={handleAssignPreset}
                            onRemovePreset={handleRemovePreset}
                            onSaveOverrides={handleSaveOverrides}
                            embedded
                        />
                    </TabsContent>

                    <TabsContent
                        value="assignments"
                        className="mt-4 min-h-0 flex-1 overflow-y-auto"
                    >
                        {assignmentsError ? (
                            <Alert variant="destructive">
                                <AlertDescription className="flex items-center justify-between gap-3">
                                    <span>Could not load assignments.</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void refetchAssignments()}
                                    >
                                        Retry
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <TeacherAssignmentsSection
                                assignments={assignments}
                                isLoading={assignmentsLoading}
                                canManage={false}
                                deletingAssignmentId={null}
                                onAdd={() => undefined}
                                onDelete={() => undefined}
                                embedded
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
