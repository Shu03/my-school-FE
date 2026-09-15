import { useMemo } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, School, Users, X } from "lucide-react";

import { attendancePage } from "@constants/routes.constants";

import { useAttendanceSummary } from "@features/attendance";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ClassAttendanceSummarySectionProps {
    sectionId: string;
    canMarkAttendance: boolean;
}

export function ClassAttendanceSummarySection({
    sectionId,
    canMarkAttendance,
}: ClassAttendanceSummarySectionProps): JSX.Element {
    const navigate = useNavigate();
    const month = new Date().toISOString().slice(0, 7);
    const {
        data: summary = [],
        isLoading,
        isError,
    } = useAttendanceSummary({ sectionId, month }, Boolean(sectionId));

    const stats = useMemo(() => {
        const totalStudents = summary.length;
        const totalPresent = summary.reduce((sum, item) => sum + item.present, 0);
        const totalAbsent = summary.reduce((sum, item) => sum + item.absent, 0);
        const totalDays = summary.reduce((sum, item) => sum + item.totalDays, 0);
        const averagePercentage =
            totalStudents > 0
                ? Math.round(
                      summary.reduce((sum, item) => sum + item.percentage, 0) / totalStudents,
                  )
                : 0;

        return {
            totalStudents,
            totalPresent,
            totalAbsent,
            totalDays,
            attendanceRate: averagePercentage,
        };
    }, [summary]);

    const monthLabel = new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
    }).format(new Date(`${month}-01T00:00:00`));
    const presentShare =
        stats.totalDays > 0 ? Math.round((stats.totalPresent / stats.totalDays) * 100) : 0;
    const absentShare = 100 - presentShare;

    return (
        <Card className="border-primary/20 gap-0 overflow-hidden shadow-sm">
            <CardHeader className="border-border/60 bg-muted/25 border-b pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <span className="bg-primary/12 text-primary flex size-8 items-center justify-center rounded-lg">
                                <School className="size-4" />
                            </span>
                            Class attendance summary
                        </CardTitle>
                        <p className="text-muted-foreground mt-2 text-sm">
                            A quick read of how consistently the class has been showing up.
                        </p>
                    </div>
                    <span className="bg-background text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
                        <CalendarDays className="size-3.5" />
                        {monthLabel}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8">
                        <Spinner />
                        <span className="text-muted-foreground text-sm">Loading...</span>
                    </div>
                ) : isError ? (
                    <p className="bg-muted/35 text-muted-foreground rounded-lg px-4 py-5 text-sm">
                        Class attendance is not available right now.
                    </p>
                ) : stats.totalStudents === 0 ? (
                    <div className="bg-muted/35 rounded-lg px-4 py-6 text-center">
                        <Users className="text-muted-foreground mx-auto size-5" />
                        <p className="mt-2 text-sm font-medium">No attendance recorded yet</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Attendance for {monthLabel} will appear here once it is marked.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.8fr)] md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary border-primary/20 flex size-24 shrink-0 flex-col items-center justify-center rounded-2xl border">
                                <span className="text-3xl leading-none font-semibold tracking-tight">
                                    {stats.attendanceRate}%
                                </span>
                                <span className="text-[11px] font-medium">attendance</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold">Class pulse</p>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Average attendance across {stats.totalStudents} students.
                                </p>
                                <div
                                    className="bg-muted mt-3 h-2 overflow-hidden rounded-full"
                                    role="progressbar"
                                    aria-label={`Average class attendance: ${stats.attendanceRate}%`}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={stats.attendanceRate}
                                >
                                    <div
                                        className="bg-primary h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                                        style={{ width: `${stats.attendanceRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Attendance record</span>
                                <span className="font-medium">{stats.totalDays} recorded days</span>
                            </div>
                            <div className="bg-muted flex h-3 overflow-hidden rounded-full">
                                <div
                                    className="bg-emerald-500 transition-[width] duration-500 motion-reduce:transition-none"
                                    style={{ width: `${presentShare}%` }}
                                    title={`${stats.totalPresent} present`}
                                />
                                <div
                                    className="bg-destructive/70 transition-[width] duration-500 motion-reduce:transition-none"
                                    style={{ width: `${absentShare}%` }}
                                    title={`${stats.totalAbsent} absent`}
                                />
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                <span className="inline-flex items-center gap-1.5">
                                    <Check className="size-3.5 text-emerald-600" />
                                    {stats.totalPresent} present
                                </span>
                                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                                    <X className="text-destructive size-3.5" />
                                    {stats.totalAbsent} absent
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                {canMarkAttendance && (
                    <div className="flex justify-end">
                        <Button onClick={() => navigate(attendancePage("mark", sectionId))}>
                            Mark attendance
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
