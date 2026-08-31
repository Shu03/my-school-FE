import { useMemo } from "react";
import type { JSX } from "react";

import { EXAM_TYPE_LABELS } from "@constants/exams.constants";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

import { useStudentGradeHistory } from "../hooks/useGrades";
import type { StudentGradeHistoryEntry } from "../types/grade.types";

interface StudentGradeHistoryCardProps {
    studentId: string;
}

const PASS_PERCENTAGE = 35;

interface ExamReport {
    examId: string;
    examName: string;
    type: StudentGradeHistoryEntry["type"];
    date: string;
    subjects: StudentGradeHistoryEntry[];
    obtained: number;
    total: number;
    percentage: number;
}

function getGrade(percentage: number): string {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= PASS_PERCENTAGE) return "E";
    return "F";
}

function formatDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }
    return parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function StudentGradeHistoryCard({ studentId }: StudentGradeHistoryCardProps): JSX.Element {
    const { data, isLoading } = useStudentGradeHistory(studentId, {});

    const reports = useMemo(() => {
        const byExam = new Map<string, ExamReport>();

        for (const entry of data?.exams ?? []) {
            let report = byExam.get(entry.examId);
            if (!report) {
                report = {
                    examId: entry.examId,
                    examName: entry.examName,
                    type: entry.type,
                    date: entry.date,
                    subjects: [],
                    obtained: 0,
                    total: 0,
                    percentage: 0,
                };
                byExam.set(entry.examId, report);
            }

            report.subjects.push(entry);
            report.obtained += entry.marksObtained;
            report.total += entry.totalMarks;
        }

        return Array.from(byExam.values())
            .map((report) => ({
                ...report,
                percentage: report.total > 0 ? (report.obtained / report.total) * 100 : 0,
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading grades...</span>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <p className="text-muted-foreground py-6 text-center text-sm">
                No grades recorded for the current academic year.
            </p>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((report) => {
                const failed = report.percentage < PASS_PERCENTAGE;

                return (
                    <article
                        key={report.examId}
                        className="bg-card ring-border flex flex-col overflow-hidden rounded-xl ring-1"
                    >
                        <header className="border-border/60 from-primary/8 flex items-start justify-between gap-3 border-b bg-linear-to-br to-transparent px-4 py-3">
                            <div className="min-w-0">
                                <h3 className="truncate font-semibold tracking-tight">
                                    {report.examName}
                                </h3>
                                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                                    <Badge variant="secondary">
                                        {EXAM_TYPE_LABELS[report.type]}
                                    </Badge>
                                    {formatDate(report.date) && (
                                        <span>{formatDate(report.date)}</span>
                                    )}
                                </div>
                            </div>
                            <Badge
                                variant={failed ? "destructive" : "secondary"}
                                className="min-w-9 shrink-0 justify-center font-mono text-sm"
                            >
                                {getGrade(report.percentage)}
                            </Badge>
                        </header>

                        <dl className="divide-border/60 flex-1 divide-y px-4">
                            {report.subjects.map((subject) => {
                                const subjectFailed =
                                    subject.totalMarks > 0 &&
                                    (subject.marksObtained / subject.totalMarks) * 100 <
                                        PASS_PERCENTAGE;

                                return (
                                    <div
                                        key={subject.subjectId}
                                        className="flex items-center justify-between gap-3 py-2.5 text-sm"
                                    >
                                        <dt className="text-foreground min-w-0 truncate">
                                            {subject.subjectName}
                                        </dt>
                                        <dd
                                            className={`shrink-0 tabular-nums ${
                                                subjectFailed
                                                    ? "text-destructive font-medium"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {subject.marksObtained}
                                            <span className="text-muted-foreground/60">
                                                /{subject.totalMarks}
                                            </span>
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>

                        <footer className="bg-muted/40 border-border/60 flex items-center justify-between border-t px-4 py-2.5">
                            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Total
                            </span>
                            <div className="flex items-baseline gap-2 tabular-nums">
                                <span className="font-semibold">
                                    {report.obtained}
                                    <span className="text-muted-foreground font-normal">
                                        /{report.total}
                                    </span>
                                </span>
                                <span
                                    className={`text-sm font-semibold ${
                                        failed ? "text-destructive" : "text-primary"
                                    }`}
                                >
                                    {report.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </footer>
                    </article>
                );
            })}
        </div>
    );
}
