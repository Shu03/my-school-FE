import { useState } from "react";
import type { JSX } from "react";

import type { Permission } from "@constants/permissions.constants";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import type { PresetFormValues } from "../schemas/teacher.schema";
import type { PermissionPreset } from "../types/teacher.types";

import { PermissionCheckboxGroup } from "./PermissionCheckboxGroup";

interface PresetFormDialogProps {
    open: boolean;
    preset: PermissionPreset | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PresetFormValues) => Promise<void>;
}

export function PresetFormDialog({
    open,
    preset,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: PresetFormDialogProps): JSX.Element {
    const isEdit = Boolean(preset);
    const [name, setName] = useState("");
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [wasOpen, setWasOpen] = useState(false);

    if (open && !wasOpen) {
        setWasOpen(true);
        setName(preset?.name ?? "");
        setPermissions(preset?.permissions ?? []);
        setError(null);
    } else if (!open && wasOpen) {
        setWasOpen(false);
    }

    function togglePermission(permission: Permission): void {
        setPermissions((current) =>
            current.includes(permission)
                ? current.filter((item) => item !== permission)
                : [...current, permission],
        );
    }

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();

        if (!name.trim()) {
            setError("Preset name is required");
            return;
        }
        if (permissions.length === 0) {
            setError("Select at least one permission");
            return;
        }

        setError(null);
        await onSubmit({ name: name.trim(), permissions });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit preset" : "Create preset"}</DialogTitle>
                    <DialogDescription>
                        Group permissions into a reusable preset for teachers.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void handleSubmit(event)}
                    noValidate
                >
                    <div className="space-y-2">
                        <Label htmlFor="preset-name">Name</Label>
                        <Input
                            id="preset-name"
                            placeholder="Class Teacher"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <PermissionCheckboxGroup
                            selected={permissions}
                            onToggle={togglePermission}
                        />
                    </div>

                    {error && <p className="text-destructive text-xs">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isEdit ? "Save changes" : "Create preset"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
