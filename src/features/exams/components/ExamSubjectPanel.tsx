import type { JSX } from "react";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";

import {
    ExamGradesSummarySection,
    GradeEntrySection,
    useExamSubjectGrades,
} from "@features/grades";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { formatDate, formatMarks } from "../lib/format";
import type { Exam, ExamSubject, ExamSubjectSummary } from "../types/exam.types";

function StudentSubjectGrade({
    examId,
    subjectId,
    totalMarks,
}: {
    examId: string;
    subjectId: string;
    totalMarks: number;
}): JSX.Element {
    const { data: grades = [], isLoading } = useExamSubjectGrades(examId, subjectId);
    const grade = grades[0] ?? null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-6">
                <Spinner />
            </div>
        );
    }

    if (!grade) {
        return (
            <p className="text-muted-foreground py-4 text-center text-sm">
                Your grade has not been published yet.
            </p>
        );
    }

    return (
        <p className="text-2xl font-semibold tabular-nums">
            {grade.marksObtained}{" "}
            <span className="text-muted-foreground text-base">/ {totalMarks}</span>
        </p>
    );
}

interface ExamSubjectPanelProps {
    exam: Exam;
    examSubject: ExamSubject;
    summary: ExamSubjectSummary | undefined;
    isStudent: boolean;
    canEnterGrades: boolean;
    canReadSummary: boolean;
    canManageSubjects: boolean;
    onEdit: (examSubject: ExamSubject) => void;
    onRemove: (examSubject: ExamSubject) => void;
    canRemove: boolean;
}

export function ExamSubjectPanel({
    exam,
    examSubject,
    summary,
    isStudent,
    canEnterGrades,
    canReadSummary,
    canManageSubjects,
    onEdit,
    onRemove,
    canRemove,
}: ExamSubjectPanelProps): JSX.Element {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {examSubject.subject.name}
                            <Badge variant="secondary" className="font-mono">
                                {examSubject.subject.code}
                            </Badge>
                        </CardTitle>
                        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-1">
                                <CalendarDays className="size-3.5" />
                                {formatDate(examSubject.date)}
                            </span>
                            <span>·</span>
                            <span>Total marks: {examSubject.totalMarks}</span>
                            {summary && (
                                <>
                                    <span>·</span>
                                    <span>Graded: {summary.gradeCount}</span>
                                    <span>·</span>
                                    <span>Average: {formatMarks(summary.averageMarks)}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {canManageSubjects && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => onEdit(examSubject)}>
                                <Pencil className="size-4" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRemove(examSubject)}
                                disabled={!canRemove}
                            >
                                <Trash2 className="size-4" />
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {isStudent && (
                    <StudentSubjectGrade
                        examId={exam.id}
                        subjectId={examSubject.subjectId}
                        totalMarks={examSubject.totalMarks}
                    />
                )}

                {canEnterGrades && (
                    <GradeEntrySection
                        examId={exam.id}
                        subjectId={examSubject.subjectId}
                        classId={exam.classId}
                        academicYearId={exam.academicYearId}
                        totalMarks={examSubject.totalMarks}
                    />
                )}

                {canReadSummary && (
                    <ExamGradesSummarySection
                        examId={exam.id}
                        subjectId={examSubject.subjectId}
                        enabled={canReadSummary}
                    />
                )}
            </CardContent>
        </Card>
    );
}
