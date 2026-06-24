import type { JSX } from "react";

import { CalendarDays, CheckCircle2, Pencil, Settings2 } from "lucide-react";

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

import { formatDate } from "../lib/format";
import type { AcademicYear } from "../types/academic-year.types";

interface AcademicYearsTableProps {
    years: AcademicYear[];
    isLoading: boolean;
    canSetCurrent: boolean;
    settingCurrentId: string | null;
    onEdit: (year: AcademicYear) => void;
    onManageTerms: (year: AcademicYear) => void;
    onSetCurrent: (year: AcademicYear) => void;
}

export function AcademicYearsTable({
    years,
    isLoading,
    canSetCurrent,
    settingCurrentId,
    onEdit,
    onManageTerms,
    onSetCurrent,
}: AcademicYearsTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-40 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading academic years...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && years.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No academic years found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        years.map((year) => (
                            <TableRow key={year.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <CalendarDays className="text-muted-foreground size-4" />
                                        {year.name}
                                    </div>
                                </TableCell>
                                <TableCell>{formatDate(year.startDate)}</TableCell>
                                <TableCell>{formatDate(year.endDate)}</TableCell>
                                <TableCell>
                                    {year.isCurrent ? (
                                        <Badge className="bg-primary/12 text-primary ring-primary/25 ring-1">
                                            Current
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Inactive</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit ${year.name}`}
                                                    onClick={() => onEdit(year)}
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
                                                    aria-label={`Manage terms for ${year.name}`}
                                                    onClick={() => onManageTerms(year)}
                                                >
                                                    <Settings2 className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Manage terms</TooltipContent>
                                        </Tooltip>

                                        {canSetCurrent && !year.isCurrent && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Set ${year.name} as current`}
                                                        onClick={() => onSetCurrent(year)}
                                                        disabled={settingCurrentId === year.id}
                                                    >
                                                        {settingCurrentId === year.id ? (
                                                            <Spinner className="size-4" />
                                                        ) : (
                                                            <CheckCircle2 className="size-4" />
                                                        )}
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Set current</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
