import { useState } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { teacherDetail } from "@constants/routes.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PresetFormDialog } from "../components/PresetFormDialog";
import { PresetsTable } from "../components/PresetsTable";
import { TeachersTable } from "../components/TeachersTable";
import {
    useCreatePreset,
    useDeletePreset,
    usePresetsList,
    useTeachersList,
    useUpdatePreset,
} from "../hooks/useTeachers";
import { getPresetDeleteErrorMessage, getTeacherErrorMessage } from "../lib/errors";
import type { PresetFormValues } from "../schemas/teacher.schema";
import type { PermissionPreset } from "../types/teacher.types";

export function TeachersPage(): JSX.Element {
    const navigate = useNavigate();

    const [presetFormOpen, setPresetFormOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<PermissionPreset | null>(null);

    const {
        data: teachers = [],
        isLoading: teachersLoading,
        isError: teachersError,
        refetch: refetchTeachers,
    } = useTeachersList();
    const {
        data: presets = [],
        isLoading: presetsLoading,
        isError: presetsError,
        refetch: refetchPresets,
    } = usePresetsList();

    const createPresetMutation = useCreatePreset();
    const updatePresetMutation = useUpdatePreset();
    const deletePresetMutation = useDeletePreset();

    function handleCreatePreset(): void {
        setEditingPreset(null);
        setPresetFormOpen(true);
    }

    function handleEditPreset(preset: PermissionPreset): void {
        setEditingPreset(preset);
        setPresetFormOpen(true);
    }

    async function handleDeletePreset(preset: PermissionPreset): Promise<void> {
        const confirmed = window.confirm(`Delete ${preset.name}? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        try {
            await deletePresetMutation.mutateAsync({ presetId: preset.id });
            toast.success("Preset deleted successfully.");
        } catch (error) {
            toast.error(getPresetDeleteErrorMessage(error));
        }
    }

    async function handlePresetSubmit(values: PresetFormValues): Promise<void> {
        try {
            if (editingPreset) {
                await updatePresetMutation.mutateAsync({
                    presetId: editingPreset.id,
                    data: values,
                });
                toast.success("Preset updated successfully.");
            } else {
                await createPresetMutation.mutateAsync(values);
                toast.success("Preset created successfully.");
            }

            setPresetFormOpen(false);
            setEditingPreset(null);
        } catch (error) {
            toast.error(getTeacherErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <Users className="size-5" />
                        Teachers
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage teacher profiles, permission presets, and class assignments.
                    </p>
                </div>

                <div className="px-6 py-6">
                    <Tabs defaultValue="teachers">
                        <TabsList>
                            <TabsTrigger value="teachers">Teachers</TabsTrigger>
                            <TabsTrigger value="presets">Permission presets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="teachers" className="mt-4">
                            {teachersError ? (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertDescription className="flex items-center justify-between gap-4">
                                        <span>Could not load teachers.</span>
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
                                <TeachersTable
                                    teachers={teachers}
                                    isLoading={teachersLoading}
                                    onView={(teacher) => navigate(teacherDetail(teacher.id))}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="presets" className="mt-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-end">
                                    <Button onClick={handleCreatePreset}>
                                        <Plus className="size-4" />
                                        Add preset
                                    </Button>
                                </div>

                                {presetsError ? (
                                    <Alert variant="destructive">
                                        <AlertCircle />
                                        <AlertDescription className="flex items-center justify-between gap-4">
                                            <span>Could not load presets.</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => void refetchPresets()}
                                            >
                                                Retry
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <PresetsTable
                                        presets={presets}
                                        isLoading={presetsLoading}
                                        deletingPresetId={
                                            deletePresetMutation.isPending
                                                ? (deletePresetMutation.variables?.presetId ?? null)
                                                : null
                                        }
                                        onEdit={handleEditPreset}
                                        onDelete={(preset) => void handleDeletePreset(preset)}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <PresetFormDialog
                open={presetFormOpen}
                preset={editingPreset}
                isSubmitting={createPresetMutation.isPending || updatePresetMutation.isPending}
                onOpenChange={setPresetFormOpen}
                onSubmit={handlePresetSubmit}
            />
        </div>
    );
}
