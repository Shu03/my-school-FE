import type { JSX } from "react";

import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useExamSummary } from "../hooks/useGrades";

interface ExamGradesSummarySectionProps {
    examId: string;
    enabled: boolean;
}

function formatValue(value: number | null): string {
    return value === null ? "-" : value.toFixed(1);
}

export function ExamGradesSummarySection({
    examId,
    enabled,
}: ExamGradesSummarySectionProps): JSX.Element {
    const { data: summary, isLoading } = useExamSummary(examId, enabled);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading summary...</span>
            </div>
        );
    }

    if (!summary) {
        return (
            <p className="text-muted-foreground py-6 text-center text-sm">No summary available.</p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="bg-muted/40 rounded-lg px-4 py-3">
                    <p className="text-muted-foreground text-xs">Graded</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {summary.students.length}
                    </p>
                </div>
                <div className="bg-muted/40 rounded-lg px-4 py-3">
                    <p className="text-muted-foreground text-xs">Average</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {formatValue(summary.classAverage)}
                    </p>
                </div>
                <div className="bg-muted/40 rounded-lg px-4 py-3">
                    <p className="text-muted-foreground text-xs">Highest</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {formatValue(summary.highest)}
                    </p>
                </div>
                <div className="bg-muted/40 rounded-lg px-4 py-3">
                    <p className="text-muted-foreground text-xs">Lowest</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {formatValue(summary.lowest)}
                    </p>
                </div>
            </div>

            {summary.students.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    No grades entered yet.
                </p>
            ) : (
                <div className="overflow-hidden rounded-xl border">
                    <Table>
                        <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead className="text-right">Marks</TableHead>
                                <TableHead className="text-right">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summary.students.map((student) => (
                                <TableRow key={student.studentId}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {student.marksObtained} / {summary.totalMarks}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {student.percentage.toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
