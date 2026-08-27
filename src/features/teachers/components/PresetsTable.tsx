import type { JSX } from "react";

import { Pencil, Shield, Trash2 } from "lucide-react";

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
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {preset.permissions.map((permission) => (
                                            <Badge key={permission} variant="secondary">
                                                {PERMISSION_LABELS[permission]}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
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
                                                    size="icon"
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
