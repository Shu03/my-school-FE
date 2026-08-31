import type { JSX } from "react";

import { EXAM_TYPE_LABELS } from "@constants/exams.constants";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useStudentGradeHistory } from "../hooks/useGrades";

interface StudentGradeHistoryCardProps {
    studentId: string;
}

export function StudentGradeHistoryCard({ studentId }: StudentGradeHistoryCardProps): JSX.Element {
    const { data, isLoading } = useStudentGradeHistory(studentId, {});
    const exams = data?.exams ?? [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading grades...</span>
            </div>
        );
    }

    if (exams.length === 0) {
        return (
            <p className="text-muted-foreground py-6 text-center text-sm">
                No grades recorded for the current academic year.
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Marks</TableHead>
                        <TableHead className="text-right">%</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {exams.map((entry) => (
                        <TableRow key={entry.examId}>
                            <TableCell className="font-medium">{entry.examName}</TableCell>
                            <TableCell>{entry.subjectName}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{EXAM_TYPE_LABELS[entry.type]}</Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {entry.marksObtained} / {entry.totalMarks}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {entry.percentage.toFixed(1)}%
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
