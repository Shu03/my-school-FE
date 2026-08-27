import type { JSX } from "react";

import { ChevronRight, UserRound } from "lucide-react";

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

import type { TeacherProfile } from "../types/teacher.types";

interface TeachersTableProps {
    teachers: TeacherProfile[];
    isLoading: boolean;
    onView: (teacher: TeacherProfile) => void;
}

export function TeachersTable({ teachers, isLoading, onView }: TeachersTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Employee code</TableHead>
                        <TableHead>Preset</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-16 text-right">
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
                                        Loading teachers...
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && teachers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No teachers found.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        teachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 font-medium">
                                        <UserRound className="text-muted-foreground size-4" />
                                        {teacher.user.firstName} {teacher.user.lastName}
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono">{teacher.employeeCode}</TableCell>
                                <TableCell>{teacher.preset?.name ?? "—"}</TableCell>
                                <TableCell>
                                    {teacher.user.isActive ? (
                                        <Badge className="bg-primary/12 text-primary ring-primary/25 ring-1">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Inactive</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`View ${teacher.user.firstName} ${teacher.user.lastName}`}
                                        onClick={() => onView(teacher)}
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
