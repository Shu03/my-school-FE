import { useState } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, Plus, ShieldCheck, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@constants/routes.constants";

import { ConfirmDialog } from "@components/common/ConfirmDialog";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PresetFormDialog } from "../components/PresetFormDialog";
import { PresetsTable } from "../components/PresetsTable";
import { TeacherDirectory } from "../components/TeacherDirectory";
import { TeacherInspector } from "../components/TeacherInspector";
import {
    useCreatePreset,
    useDeletePreset,
    usePresetsList,
    useTeachersList,
    useUpdatePreset,
} from "../hooks/useTeachers";
import { getPresetDeleteErrorMessage, getTeacherErrorMessage } from "../lib/errors";
import type { PresetFormValues } from "../schemas/teacher.schema";
import type { PermissionPreset, TeacherProfile } from "../types/teacher.types";

export function TeachersPage(): JSX.Element {
    const navigate = useNavigate();

    const [presetFormOpen, setPresetFormOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<PermissionPreset | null>(null);
    const [deletingPreset, setDeletingPreset] = useState<PermissionPreset | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

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
    const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId) ?? null;

    function handleSelectTeacher(teacher: TeacherProfile): void {
        setSelectedTeacherId(teacher.id);
    }

    function handleCreatePreset(): void {
        setEditingPreset(null);
        setPresetFormOpen(true);
    }

    function handleEditPreset(preset: PermissionPreset): void {
        setEditingPreset(preset);
        setPresetFormOpen(true);
    }

    async function handleDeletePreset(): Promise<void> {
        if (!deletingPreset) return;
        try {
            await deletePresetMutation.mutateAsync({ presetId: deletingPreset.id });
            toast.success("Preset deleted successfully.");
            setDeletingPreset(null);
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
                                    Manage faculty profiles, access, and teaching assignments.
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
                    <Tabs defaultValue="teachers">
                        <TabsList className="h-10 w-full sm:w-auto">
                            <TabsTrigger value="teachers">
                                <Users />
                                Teachers
                            </TabsTrigger>
                            <TabsTrigger value="presets">
                                <ShieldCheck />
                                Permission presets
                            </TabsTrigger>
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
                                <div className="min-w-0">
                                    <TeacherDirectory
                                        teachers={teachers}
                                        presets={presets}
                                        isLoading={teachersLoading}
                                        selectedTeacherId={selectedTeacherId}
                                        onSelect={handleSelectTeacher}
                                    />
                                </div>
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
                                        onDelete={setDeletingPreset}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <TeacherInspector
                    teacher={selectedTeacher}
                    presets={presets}
                    onOpenChange={(open) => {
                        if (!open) setSelectedTeacherId(null);
                    }}
                />
            </div>

            <PresetFormDialog
                key={`${editingPreset?.id ?? "new"}-${presetFormOpen ? "open" : "closed"}`}
                open={presetFormOpen}
                preset={editingPreset}
                isSubmitting={createPresetMutation.isPending || updatePresetMutation.isPending}
                onOpenChange={setPresetFormOpen}
                onSubmit={handlePresetSubmit}
            />
            <ConfirmDialog
                open={Boolean(deletingPreset)}
                title="Delete permission preset?"
                description={
                    deletingPreset
                        ? `${deletingPreset.name} will no longer be available for assignment. The server will prevent deletion if teachers still depend on it.`
                        : ""
                }
                confirmLabel="Delete preset"
                isPending={deletePresetMutation.isPending}
                onOpenChange={(open) => {
                    if (!open) setDeletingPreset(null);
                }}
                onConfirm={() => void handleDeletePreset()}
            />
        </div>
    );
}
