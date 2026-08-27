import type { JSX } from "react";

import { ChevronRight, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { formatDate } from "../lib/format";
import type { StudentProfile } from "../types/student.types";

interface StudentsTableProps {
    students: StudentProfile[];
    isLoading: boolean;
    selectable: boolean;
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onView: (student: StudentProfile) => void;
}

export function StudentsTable({
    students,
    isLoading,
    selectable,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onView,
}: StudentsTableProps): JSX.Element {
    const columnCount = selectable ? 5 : 4;
    const allSelected = students.length > 0 && selectedIds.length === students.length;

    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        {selectable && (
                            <TableHead className="w-10">
                                <Input
                                    type="checkbox"
                                    className="size-4"
                                    aria-label="Select all students"
                                    checked={allSelected}
                                    onChange={onToggleSelectAll}
                                />
                            </TableHead>
                        )}
                        <TableHead>Name</TableHead>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Date of birth</TableHead>
                        <TableHead className="w-16 text-right">
                            <span className="sr-only">View</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={columnCount}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading students...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && students.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={columnCount}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No students found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        students.map((student) => (
                            <TableRow key={student.id}>
                                {selectable && (
                                    <TableCell>
                                        <Input
                                            type="checkbox"
                                            className="size-4"
                                            aria-label={`Select ${student.user.firstName} ${student.user.lastName}`}
                                            checked={selectedIds.includes(student.id)}
                                            onChange={() => onToggleSelect(student.id)}
                                        />
                                    </TableCell>
                                )}
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <GraduationCap className="text-muted-foreground size-4" />
                                        {student.user.firstName} {student.user.lastName}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-mono">
                                        {student.admissionNumber}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(student.dateOfBirth)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`View ${student.user.firstName} ${student.user.lastName}`}
                                        onClick={() => onView(student)}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
