import { useMemo, useState } from "react";
import type { JSX } from "react";

import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from "@constants/attendance.constants";

import { Role } from "@/types/api";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";
import { useCurrentStudentEnrollment } from "@features/students";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    useAttendanceSummary,
    useClassAttendance,
    useStudentAttendance,
} from "../hooks/useAttendance";
import { schoolCurrentMonth, schoolToday } from "../lib/format";
import type { AttendanceRecord } from "../types/attendance.types";

interface MonthStats {
    totalDays: number;
    present: number;
    absent: number;
    percentage: number;
}

function getMonthBounds(month: string): { startDate: string; endDate: string } {
    const [yearText, monthText] = month.split("-");
    const year = Number(yearText);
    const monthIndex = Number(monthText) - 1;

    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0));

    return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
    };
}

function summarizeMonthly(records: AttendanceRecord[]): MonthStats {
    const totalDays = records.length;
    const present = records.filter((record) => record.status === ATTENDANCE_STATUS.PRESENT).length;
    const absent = records.filter((record) => record.status === ATTENDANCE_STATUS.ABSENT).length;
    const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    return { totalDays, present, absent, percentage };
}

export function AttendanceOverviewView(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const isStudent = user?.role === Role.STUDENT;

    const [sectionId, setSectionId] = useState("");
    const [date, setDate] = useState(schoolToday());
    const [month, setMonth] = useState(schoolCurrentMonth());

    const { startDate, endDate } = useMemo(() => getMonthBounds(month), [month]);

    const { data: currentYear } = useCurrentAcademicYear();
    const { enrollment: currentEnrollment, isLoading: enrollmentLoading } =
        useCurrentStudentEnrollment();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id) && !isStudent,
    );

    const classViewEnabled = !isStudent && Boolean(sectionId && date);
    const classSummaryEnabled = !isStudent && Boolean(sectionId && month);

    const { data: classRecords = [], isLoading: classRecordsLoading } = useClassAttendance(
        { sectionId, date },
        classViewEnabled,
    );
    const { data: classSummary = [], isLoading: classSummaryLoading } = useAttendanceSummary(
        { sectionId, month },
        classSummaryEnabled,
    );

    const studentId = user?.studentProfileId ?? null;
    const studentEnabled = Boolean(
        isStudent && studentId && currentYear?.id && currentEnrollment?.sectionId,
    );
    const { data: studentMonthlyRecords = [], isLoading: studentMonthlyLoading } =
        useStudentAttendance(
            studentId,
            {
                academicYearId: currentYear?.id,
                startDate,
                endDate,
            },
            studentEnabled,
        );

    const studentDailyRecords = studentMonthlyRecords.filter((record) => record.date === date);
    const studentMonthStats = summarizeMonthly(studentMonthlyRecords);

    return (
        <div className="flex flex-col gap-5">
            <div className="bg-muted/35 border-border/60 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                {!isStudent && (
                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Select value={sectionId} onValueChange={setSectionId}>
                            <SelectTrigger className="w-full" aria-label="Select class">
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name} (Class {item.classLevel})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="attendance-overview-date">Date</Label>
                    <input
                        id="attendance-overview-date"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="attendance-overview-month">Month</Label>
                    <input
                        id="attendance-overview-month"
                        type="month"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
                        className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    />
                </div>
            </div>

            {!isStudent && !classViewEnabled && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    Select a class to view attendance and summary.
                </p>
            )}

            {isStudent &&
                (enrollmentLoading ? (
                    <div className="flex items-center gap-2 py-2">
                        <Spinner />
                        <span className="text-muted-foreground text-sm">Loading your class...</span>
                    </div>
                ) : currentEnrollment ? (
                    <p className="text-muted-foreground text-sm">
                        {currentEnrollment.section.name} / Showing your attendance for {month}.
                    </p>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        You are not enrolled in an active class for the current academic year.
                    </p>
                ))}

            {!isStudent && classViewEnabled && (
                <Card className="gap-0">
                    <CardHeader>
                        <CardTitle className="text-base">Daily attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {classRecordsLoading ? (
                            <div className="flex items-center justify-center gap-2 py-10">
                                <Spinner />
                                <span className="text-muted-foreground text-sm">Loading...</span>
                            </div>
                        ) : classRecords.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                No attendance recorded for this class on the selected date.
                            </p>
                        ) : (
                            <div className="overflow-hidden rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Admission #</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">
                                                    {record.student.user.firstName}{" "}
                                                    {record.student.user.lastName}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {record.student.admissionNumber}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            record.status ===
                                                            ATTENDANCE_STATUS.PRESENT
                                                                ? "default"
                                                                : "destructive"
                                                        }
                                                    >
                                                        {ATTENDANCE_STATUS_LABELS[record.status]}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {!isStudent && classSummaryEnabled && (
                <Card className="gap-0">
                    <CardHeader>
                        <CardTitle className="text-base">Monthly summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {classSummaryLoading ? (
                            <div className="flex items-center justify-center gap-2 py-10">
                                <Spinner />
                                <span className="text-muted-foreground text-sm">Loading...</span>
                            </div>
                        ) : classSummary.length === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                No attendance data for this class in the selected month.
                            </p>
                        ) : (
                            <div className="overflow-hidden rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead className="text-right">Total days</TableHead>
                                            <TableHead className="text-right">Present</TableHead>
                                            <TableHead className="text-right">Absent</TableHead>
                                            <TableHead className="text-right">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classSummary.map((item) => (
                                            <TableRow key={item.studentId}>
                                                <TableCell className="font-medium">
                                                    {item.firstName} {item.lastName}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.totalDays}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.present}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.absent}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {item.percentage}%
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {isStudent && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Daily status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {studentMonthlyLoading ? (
                                <div className="flex items-center justify-center gap-2 py-6">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading...
                                    </span>
                                </div>
                            ) : !currentEnrollment ? (
                                <p className="text-muted-foreground text-sm">
                                    Attendance will appear once you are enrolled in a current class.
                                </p>
                            ) : studentDailyRecords.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No attendance recorded for the selected date.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {studentDailyRecords.map((record) => (
                                        <div
                                            key={record.id}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="text-sm font-medium">
                                                {record.date}
                                            </span>
                                            <Badge
                                                variant={
                                                    record.status === ATTENDANCE_STATUS.PRESENT
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {ATTENDANCE_STATUS_LABELS[record.status]}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Monthly summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {studentMonthlyLoading ? (
                                <div className="flex items-center justify-center gap-2 py-6">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading...
                                    </span>
                                </div>
                            ) : (
                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">
                                            Total days
                                        </dt>
                                        <dd className="text-lg font-semibold">
                                            {studentMonthStats.totalDays}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">Present</dt>
                                        <dd className="text-lg font-semibold">
                                            {studentMonthStats.present}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">Absent</dt>
                                        <dd className="text-lg font-semibold">
                                            {studentMonthStats.absent}
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                        <dt className="text-muted-foreground text-xs">
                                            Attendance %
                                        </dt>
                                        <dd className="text-lg font-semibold">
                                            {studentMonthStats.percentage}%
                                        </dd>
                                    </div>
                                </dl>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
