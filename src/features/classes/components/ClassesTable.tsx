import type { JSX } from "react";

import { Pencil, UserRoundCog } from "lucide-react";

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

import type { SchoolClass } from "../types/class.types";

interface ClassesTableProps {
    classes: SchoolClass[];
    isLoading: boolean;
    yearNameById: Record<string, string>;
    teacherNameById: Record<string, string>;
    teacherActionLoadingClassId: string | null;
    onEdit: (schoolClass: SchoolClass) => void;
    onManageTeacher: (schoolClass: SchoolClass) => void;
}

export function ClassesTable({
    classes,
    isLoading,
    yearNameById,
    teacherNameById,
    teacherActionLoadingClassId,
    onEdit,
    onManageTeacher,
}: ClassesTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Academic year</TableHead>
                        <TableHead>Class teacher</TableHead>
                        <TableHead className="w-24 text-right">
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
                                        Loading classes...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && classes.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No classes found for the selected filters.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        classes.map((schoolClass) => {
                            const teacherName = schoolClass.classTeacherId
                                ? (teacherNameById[schoolClass.classTeacherId] ?? "Assigned")
                                : "Not assigned";

                            return (
                                <TableRow key={schoolClass.id}>
                                    <TableCell className="font-medium">
                                        {schoolClass.name}
                                    </TableCell>
                                    <TableCell>{schoolClass.gradeLevel}</TableCell>
                                    <TableCell>
                                        {yearNameById[schoolClass.academicYearId] ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        {schoolClass.classTeacherId ? (
                                            <Badge variant="secondary">{teacherName}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">
                                                Not assigned
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${schoolClass.name}`}
                                                onClick={() => onEdit(schoolClass)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Manage teacher for ${schoolClass.name}`}
                                                disabled={
                                                    teacherActionLoadingClassId === schoolClass.id
                                                }
                                                onClick={() => onManageTeacher(schoolClass)}
                                            >
                                                {teacherActionLoadingClassId === schoolClass.id ? (
                                                    <Spinner className="size-4" />
                                                ) : (
                                                    <UserRoundCog className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </div>
    );
}
