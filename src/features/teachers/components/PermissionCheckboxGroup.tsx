import { useId, type JSX } from "react";

import { PERMISSION_LABELS, PERMISSIONS, type Permission } from "@constants/permissions.constants";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PermissionCheckboxGroupProps {
    selected: Permission[];
    onToggle: (permission: Permission) => void;
    inherited?: Permission[];
}

const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
    {
        label: "Academics",
        permissions: [
            PERMISSIONS.ACADEMIC_YEAR_MANAGE,
            PERMISSIONS.CLASS_MANAGE,
            PERMISSIONS.SUBJECT_MANAGE,
            PERMISSIONS.HOMEWORK_MANAGE,
            PERMISSIONS.NOTES_UPLOAD,
        ],
    },
    {
        label: "Attendance and grades",
        permissions: [
            PERMISSIONS.ATTENDANCE_READ,
            PERMISSIONS.ATTENDANCE_WRITE,
            PERMISSIONS.GRADES_READ,
            PERMISSIONS.GRADES_WRITE,
            PERMISSIONS.REPORTS_VIEW,
        ],
    },
    {
        label: "School operations",
        permissions: [
            PERMISSIONS.ANNOUNCEMENTS_MANAGE,
            PERMISSIONS.FEES_MANAGE,
            PERMISSIONS.LEAVE_APPLY,
        ],
    },
];

export function PermissionCheckboxGroup({
    selected,
    onToggle,
    inherited = [],
}: PermissionCheckboxGroupProps): JSX.Element {
    const idPrefix = useId();

    return (
        <div className="grid gap-4">
            {PERMISSION_GROUPS.map((group) => (
                <fieldset key={group.label} className="space-y-2">
                    <legend className="text-muted-foreground text-xs font-semibold">
                        {group.label}
                    </legend>
                    <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        {group.permissions.map((permission) => {
                            const isInherited = inherited.includes(permission);
                            const inputId = `${idPrefix}-${permission}`;

                            return (
                                <Label
                                    key={permission}
                                    htmlFor={inputId}
                                    className="border-border/60 has-checked:border-primary/25 has-checked:bg-primary/5 flex min-h-10 items-center gap-2 rounded-lg border px-2.5 py-2 text-sm font-normal"
                                >
                                    <Input
                                        id={inputId}
                                        type="checkbox"
                                        className="size-4"
                                        checked={isInherited || selected.includes(permission)}
                                        disabled={isInherited}
                                        onChange={() => onToggle(permission)}
                                    />
                                    <span className="min-w-0 flex-1">
                                        {PERMISSION_LABELS[permission]}
                                    </span>
                                    {isInherited ? (
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 text-[0.65rem]"
                                        >
                                            Preset
                                        </Badge>
                                    ) : null}
                                </Label>
                            );
                        })}
                    </div>
                </fieldset>
            ))}
        </div>
    );
}
