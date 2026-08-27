import type { JSX } from "react";

import {
    PERMISSION_LABELS,
    PERMISSION_LIST,
    type Permission,
} from "@constants/permissions.constants";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PermissionCheckboxGroupProps {
    selected: Permission[];
    onToggle: (permission: Permission) => void;
}

export function PermissionCheckboxGroup({
    selected,
    onToggle,
}: PermissionCheckboxGroupProps): JSX.Element {
    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PERMISSION_LIST.map((permission) => (
                <Label
                    key={permission}
                    className="flex items-center gap-2 text-sm font-normal"
                    htmlFor={`perm-${permission}`}
                >
                    <Input
                        id={`perm-${permission}`}
                        type="checkbox"
                        className="size-4"
                        checked={selected.includes(permission)}
                        onChange={() => onToggle(permission)}
                    />
                    {PERMISSION_LABELS[permission]}
                </Label>
            ))}
        </div>
    );
}
