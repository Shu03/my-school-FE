import { useMemo, useState } from "react";
import type { JSX } from "react";

import { PERMISSION_LABELS, type Permission } from "@constants/permissions.constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import type { PermissionPreset, TeacherProfile } from "../types/teacher.types";

import { PermissionCheckboxGroup } from "./PermissionCheckboxGroup";

interface TeacherPermissionsCardProps {
    teacher: TeacherProfile;
    presets: PermissionPreset[];
    canManage: boolean;
    isAssigningPreset: boolean;
    isRemovingPreset: boolean;
    isSavingOverrides: boolean;
    onAssignPreset: (presetId: string) => void;
    onRemovePreset: () => void;
    onSaveOverrides: (permissions: Permission[]) => void;
    embedded?: boolean;
}

export function TeacherPermissionsCard({
    teacher,
    presets,
    canManage,
    isAssigningPreset,
    isRemovingPreset,
    isSavingOverrides,
    onAssignPreset,
    onRemovePreset,
    onSaveOverrides,
    embedded = false,
}: TeacherPermissionsCardProps): JSX.Element {
    const [overrides, setOverrides] = useState<Permission[]>(teacher.permissionOverrides);
    const [syncedOverrides, setSyncedOverrides] = useState<Permission[]>(
        teacher.permissionOverrides,
    );

    if (syncedOverrides !== teacher.permissionOverrides) {
        setSyncedOverrides(teacher.permissionOverrides);
        setOverrides(teacher.permissionOverrides);
    }

    const effectivePermissions = useMemo(() => {
        const merged = new Set<Permission>([
            ...(teacher.preset?.permissions ?? []),
            ...teacher.permissionOverrides,
        ]);
        return [...merged];
    }, [teacher.preset, teacher.permissionOverrides]);

    const isDirty =
        overrides.length !== teacher.permissionOverrides.length ||
        overrides.some((permission) => !teacher.permissionOverrides.includes(permission));

    function toggleOverride(permission: Permission): void {
        setOverrides((current) =>
            current.includes(permission)
                ? current.filter((item) => item !== permission)
                : [...current, permission],
        );
    }

    const content = (
        <div className="space-y-6">
            <section className="space-y-2">
                <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                    Assigned preset
                </Label>
                {canManage ? (
                    <div className="flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
                        <Select
                            value={teacher.presetId ?? ""}
                            onValueChange={onAssignPreset}
                            disabled={isAssigningPreset}
                        >
                            <SelectTrigger className="w-full" aria-label="Assign preset">
                                <SelectValue placeholder="Assign a preset" />
                            </SelectTrigger>
                            <SelectContent>
                                {presets.map((preset) => (
                                    <SelectItem key={preset.id} value={preset.id}>
                                        {preset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {teacher.presetId && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRemovePreset}
                                disabled={isRemovingPreset}
                            >
                                {isRemovingPreset && <Spinner className="size-4" />}
                                Remove preset
                            </Button>
                        )}
                    </div>
                ) : (
                    <p className="text-sm">{teacher.preset?.name ?? "None"}</p>
                )}
                <p className="text-muted-foreground text-xs">
                    Preset permissions are inherited and cannot be removed here.
                </p>
            </section>

            {canManage && (
                <section className="border-border/60 space-y-3 border-t pt-5">
                    <div className="flex items-center justify-between gap-3">
                        <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                            Teacher-specific additions
                        </Label>
                        <Badge variant={isDirty ? "warning" : "secondary"}>
                            {isDirty ? "Unsaved changes" : `${overrides.length} added`}
                        </Badge>
                    </div>
                    <PermissionCheckboxGroup
                        selected={overrides}
                        inherited={teacher.preset?.permissions ?? []}
                        onToggle={toggleOverride}
                    />
                    <Button
                        size="sm"
                        onClick={() => onSaveOverrides(overrides)}
                        disabled={isSavingOverrides || !isDirty}
                    >
                        {isSavingOverrides && <Spinner className="size-4" />}
                        Save overrides
                    </Button>
                </section>
            )}

            <section className="border-border/60 space-y-2 border-t pt-5">
                <div className="flex items-center justify-between gap-3">
                    <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                        Effective access
                    </Label>
                    <Badge variant="secondary">{effectivePermissions.length} permissions</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                    {effectivePermissions.length === 0 ? (
                        <span className="text-muted-foreground text-sm">No access assigned</span>
                    ) : (
                        effectivePermissions.map((permission) => (
                            <Badge key={permission} variant="outline">
                                {PERMISSION_LABELS[permission]}
                            </Badge>
                        ))
                    )}
                </div>
            </section>
        </div>
    );

    return embedded ? (
        content
    ) : (
        <div className="bg-card text-card-foreground ring-foreground/10 rounded-xl p-6 shadow-sm ring-1">
            <h2 className="mb-5 text-base font-semibold">Permissions</h2>
            {content}
        </div>
    );
}
