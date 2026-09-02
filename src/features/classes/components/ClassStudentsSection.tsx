import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { ChevronRight, GraduationCap, Users } from "lucide-react";

import { studentDetail } from "@constants/routes.constants";

import { useStudentsList } from "@features/students";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ClassStudentsSectionProps {
    classId: string;
    academicYearId: string;
}

export function ClassStudentsSection({
    classId,
    academicYearId,
}: ClassStudentsSectionProps): JSX.Element {
    const navigate = useNavigate();
    const { data, isLoading } = useStudentsList({ classId, academicYearId, limit: 100 });

    const students = data?.data ?? [];
    const total = data?.total ?? students.length;

    return (
        <Card className="gap-0">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-base">Enrolled students</CardTitle>
                {!isLoading && (
                    <Badge variant="secondary" className="tabular-nums">
                        {total}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="px-0 pb-0">
                {isLoading ? (
                    <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
                        <Spinner />
                        <span>Loading students…</span>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-center text-sm">
                        <Users className="size-8 opacity-40" />
                        <p>No students enrolled in this Section yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Admission No.</TableHead>
                                <TableHead className="w-16 text-right">
                                    <span className="sr-only">View</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
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
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`View ${student.user.firstName} ${student.user.lastName}`}
                                            onClick={() => navigate(studentDetail(student.id))}
                                        >
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
