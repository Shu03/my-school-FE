import type { JSX } from "react";

import { KeyRound, Pencil, Shield, Trash2 } from "lucide-react";

import { PERMISSION_LABELS } from "@constants/permissions.constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { PermissionPreset } from "../types/teacher.types";

interface PresetsTableProps {
    presets: PermissionPreset[];
    isLoading: boolean;
    deletingPresetId: string | null;
    onEdit: (preset: PermissionPreset) => void;
    onDelete: (preset: PermissionPreset) => void;
}

export function PresetsTable({
    presets,
    isLoading,
    deletingPresetId,
    onEdit,
    onDelete,
}: PresetsTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="w-28 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading presets...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && presets.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No presets found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        presets.map((preset) => (
                            <TableRow key={preset.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Shield className="text-muted-foreground size-4" />
                                        {preset.name}
                                    </div>
                                </TableCell>
                                <TableCell className="whitespace-normal">
                                    <div className="flex items-start gap-2">
                                        <Badge variant="secondary" className="shrink-0">
                                            <KeyRound />
                                            {preset.permissions.length}
                                        </Badge>
                                        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                                            {preset.permissions
                                                .slice(0, 4)
                                                .map((permission) => PERMISSION_LABELS[permission])
                                                .join(", ")}
                                            {preset.permissions.length > 4
                                                ? ` and ${preset.permissions.length - 4} more`
                                                : ""}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-lg"
                                                    aria-label={`Edit ${preset.name}`}
                                                    onClick={() => onEdit(preset)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-lg"
                                                    className="text-destructive"
                                                    aria-label={`Delete ${preset.name}`}
                                                    onClick={() => onDelete(preset)}
                                                    disabled={deletingPresetId === preset.id}
                                                >
                                                    {deletingPresetId === preset.id ? (
                                                        <Spinner className="size-4" />
                                                    ) : (
                                                        <Trash2 className="size-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
