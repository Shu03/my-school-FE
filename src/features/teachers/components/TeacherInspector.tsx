import type { JSX } from "react";

import { ClipboardList, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import type { Permission } from "@constants/permissions.constants";

import { InspectorPanel } from "@components/common/InspectorPanel";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
        <>
            <InspectorPanel
                open
                title={fullName}
                description={`Manage profile, permissions, and assignments for ${fullName}.`}
                onOpenChange={onOpenChange}
            >
                <div className="flex min-h-full flex-col">
                    <header className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-5 py-5 pr-14">
                        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Teacher setup
                        </p>
                        <h2 className="mt-1 text-lg font-semibold">Access and assignments</h2>
                    </header>

                    <Tabs
                        defaultValue="permissions"
                        className="flex min-h-0 flex-1 flex-col px-5 py-4"
                    >
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

                        <TabsContent value="permissions" className="mt-4">
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

                        <TabsContent value="assignments" className="mt-4">
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
                </div>
            </InspectorPanel>
        </>
    );
}
