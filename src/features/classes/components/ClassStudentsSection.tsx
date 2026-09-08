import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { GraduationCap, Users } from "lucide-react";

import { studentDetail } from "@constants/routes.constants";

import { useStudentsList } from "@features/students";

import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

interface ClassStudentsSectionProps {
    sectionId: string;
    academicYearId: string;
}

export function ClassStudentsSection({
    sectionId,
    academicYearId,
}: ClassStudentsSectionProps): JSX.Element {
    const navigate = useNavigate();
    const { data, isLoading } = useStudentsList({ sectionId, academicYearId, limit: 100 });

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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow
                                    key={student.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View details for ${student.user.firstName} ${student.user.lastName}`}
                                    onClick={() => navigate(studentDetail(student.id))}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            navigate(studentDetail(student.id));
                                        }
                                    }}
                                    className={cn(
                                        "hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-ring/40 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset",
                                    )}
                                >
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
