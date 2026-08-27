import { useMemo, useState } from "react";
import type { JSX } from "react";

import { PERMISSION_LABELS, type Permission } from "@constants/permissions.constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    function toggleOverride(permission: Permission): void {
        setOverrides((current) =>
            current.includes(permission)
                ? current.filter((item) => item !== permission)
                : [...current, permission],
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                        Effective permissions
                    </Label>
                    <div className="flex flex-wrap gap-1">
                        {effectivePermissions.length === 0 ? (
                            <span className="text-muted-foreground text-sm">None</span>
                        ) : (
                            effectivePermissions.map((permission) => (
                                <Badge key={permission} variant="secondary">
                                    {PERMISSION_LABELS[permission]}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                        Preset
                    </Label>
                    {canManage ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={teacher.presetId ?? ""}
                                onValueChange={onAssignPreset}
                                disabled={isAssigningPreset}
                            >
                                <SelectTrigger className="w-56" aria-label="Assign preset">
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
                </div>

                {canManage && (
                    <div className="space-y-3">
                        <Label className="text-muted-foreground text-xs tracking-wider uppercase">
                            Permission overrides
                        </Label>
                        <PermissionCheckboxGroup selected={overrides} onToggle={toggleOverride} />
                        <Button
                            size="sm"
                            onClick={() => onSaveOverrides(overrides)}
                            disabled={isSavingOverrides}
                        >
                            {isSavingOverrides && <Spinner className="size-4" />}
                            Save overrides
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
