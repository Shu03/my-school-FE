import type { JSX } from "react";

import { Award, BookOpenCheck, ChartNoAxesCombined, Medal } from "lucide-react";

import { useAuthStore } from "@features/auth";
import { StudentGradeHistoryCard, useStudentGradeHistory } from "@features/grades";

import { Alert, AlertDescription } from "@/components/ui/alert";

function getGrade(percentage: number): string {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 35) return "E";
    return "F";
}

export function MyReportCardPage(): JSX.Element {
    const studentProfileId = useAuthStore((s) => s.user?.studentProfileId ?? null);
    const { data: gradeHistory } = useStudentGradeHistory(studentProfileId, {});
    const entries = gradeHistory?.exams ?? [];
    const totalMarks = entries.reduce((sum, entry) => sum + entry.totalMarks, 0);
    const obtainedMarks = entries.reduce((sum, entry) => sum + entry.marksObtained, 0);
    const overallPercentage =
        entries.length > 0
            ? entries.reduce((sum, entry) => sum + entry.percentage, 0) / entries.length
            : 0;
    const examCount = new Set(entries.map((entry) => entry.examId)).size;

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-center gap-4">
                        <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                            <Award className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-xl font-semibold tracking-tight">Report card</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Your recorded marks, gathered into one academic snapshot.
                            </p>
                        </div>
                    </div>
                </div>
                <dl className="grid grid-cols-1 gap-3 px-6 py-6 sm:grid-cols-3">
                    <div className="border-border/60 bg-muted/25 rounded-lg border px-4 py-3">
                        <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                            <ChartNoAxesCombined className="size-3.5" /> Overall performance
                        </dt>
                        <dd className="mt-1 text-2xl font-bold tabular-nums">
                            {overallPercentage.toFixed(1)}%
                        </dd>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {obtainedMarks} of {totalMarks} marks
                        </p>
                    </div>
                    <div className="border-border/60 bg-muted/25 rounded-lg border px-4 py-3">
                        <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                            <BookOpenCheck className="size-3.5" /> Exams recorded
                        </dt>
                        <dd className="mt-1 text-2xl font-bold tabular-nums">{examCount}</dd>
                        <p className="text-muted-foreground mt-1 text-xs">Across all subjects</p>
                    </div>
                    <div className="border-border/60 bg-muted/25 rounded-lg border px-4 py-3">
                        <dt className="text-muted-foreground flex items-center gap-2 text-xs">
                            <Medal className="size-3.5" /> Current grade
                        </dt>
                        <dd className="mt-1 text-2xl font-bold">
                            {entries.length > 0 ? getGrade(overallPercentage) : "-"}
                        </dd>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Based on recorded marks
                        </p>
                    </div>
                </dl>
            </div>

            {studentProfileId ? (
                <StudentGradeHistoryCard studentId={studentProfileId} />
            ) : (
                <Alert>
                    <AlertDescription>
                        No student profile is linked to your account.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
