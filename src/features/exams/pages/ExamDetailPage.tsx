import type { JSX } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { AlertCircle, ArrowLeft, CalendarDays } from "lucide-react";

import { EXAM_STATUS, EXAM_TYPE_LABELS } from "@constants/exams.constants";
import { PERMISSIONS } from "@constants/permissions.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { hasPermission, useAuthStore } from "@features/auth";
import {
    ExamGradesSummarySection,
    GradeEntrySection,
    useExamGrades,
} from "@features/grades";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { useExam } from "../hooks/useExams";
import { formatDate, formatMarks } from "../lib/format";

function StudentGradeCard({ examId, totalMarks }: { examId: string; totalMarks: number }): JSX.Element {
    const { data: grades = [], isLoading } = useExamGrades(examId);
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

export function ExamDetailPage(): JSX.Element {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const isAdmin = user?.role === Role.ADMIN;
    const isStudent = user?.role === Role.STUDENT;
    const canWrite = isAdmin || hasPermission(user?.permissions, PERMISSIONS.GRADES_WRITE);
    const canReadSummary = isAdmin || hasPermission(user?.permissions, PERMISSIONS.GRADES_READ);

    const { data: exam, isLoading, isError } = useExam(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading exam...</span>
            </div>
        );
    }

    if (isError || !exam) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>Could not load this exam.</AlertDescription>
            </Alert>
        );
    }

    const isActive = exam.status === EXAM_STATUS.ACTIVE;
    const canEnterGrades = canWrite && isActive && !exam.isFinalized;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-3"
                    onClick={() => navigate(ROUTES.EXAMS)}
                >
                    <ArrowLeft className="size-4" />
                    Back to exams
                </Button>

                <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                    <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {exam.name}
                                </h1>
                                <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    <Badge variant="secondary">
                                        {EXAM_TYPE_LABELS[exam.type]}
                                    </Badge>
                                    <span>
                                        {exam.class.name} (Grade {exam.class.gradeLevel})
                                    </span>
                                    <span>·</span>
                                    <Badge variant="secondary" className="font-mono">
                                        {exam.subject.code}
                                    </Badge>
                                    <span>·</span>
                                    <span className="inline-flex items-center gap-1">
                                        <CalendarDays className="size-3.5" />
                                        {formatDate(exam.date)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                {exam.status === EXAM_STATUS.DISCARDED ? (
                                    <Badge variant="destructive">Discarded</Badge>
                                ) : exam.isFinalized ? (
                                    <Badge>Finalized</Badge>
                                ) : (
                                    <Badge variant="outline">Active</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 px-6 py-5">
                        <div>
                            <p className="text-muted-foreground text-xs">Total marks</p>
                            <p className="text-lg font-semibold tabular-nums">{exam.totalMarks}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Graded</p>
                            <p className="text-lg font-semibold tabular-nums">{exam.gradeCount}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Average</p>
                            <p className="text-lg font-semibold tabular-nums">
                                {formatMarks(exam.averageMarks)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {isStudent && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your grade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StudentGradeCard examId={exam.id} totalMarks={exam.totalMarks} />
                    </CardContent>
                </Card>
            )}

            {canEnterGrades && (
                <Card>
                    <CardHeader>
                        <CardTitle>Enter grades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GradeEntrySection
                            examId={exam.id}
                            classId={exam.classId}
                            academicYearId={exam.academicYearId}
                            totalMarks={exam.totalMarks}
                        />
                    </CardContent>
                </Card>
            )}

            {canReadSummary && (
                <Card>
                    <CardHeader>
                        <CardTitle>Grades summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ExamGradesSummarySection examId={exam.id} enabled={canReadSummary} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
