import { useState } from "react";
import type { JSX } from "react";

import { Role } from "@/types/api";

import { formatSectionLabel } from "@lib/section";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";
import { useTeacherAccess } from "@features/request-access";

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

import { useAttendanceDay, useAttendanceSummary } from "../hooks/useAttendance";
import { schoolCurrentMonth, schoolToday } from "../lib/format";

export function AttendanceOverviewView(): JSX.Element {
    const user = useAuthStore((s) => s.user);

    const [sectionId, setSectionId] = useState("");
    const [date, setDate] = useState(schoolToday());
    const [month, setMonth] = useState(schoolCurrentMonth());

    const { data: currentYear } = useCurrentAcademicYear();
    const { assignments = [] } = useTeacherAccess();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const sectionOptions =
        user?.role === Role.ADMIN
            ? classes
            : Array.from(
                  new Map(
                      assignments.map((assignment) => [
                          assignment.sectionId,
                          {
                              id: assignment.sectionId,
                              name: assignment.section.name,
                              classLevel: assignment.section.classLevel,
                          },
                      ]),
                  ).values(),
              );
    const classViewEnabled = Boolean(sectionId && date);
    const classSummaryEnabled = Boolean(sectionId && month);

    const { data: classDay, isLoading: classRecordsLoading } = useAttendanceDay(
        { sectionId, date },
        classViewEnabled,
    );
    const classRecords = classDay?.students ?? [];
    const { data: classSummary = [], isLoading: classSummaryLoading } = useAttendanceSummary(
        { sectionId, month },
        classSummaryEnabled,
    );

    return (
        <div className="flex flex-col gap-5">
            <div className="bg-muted/35 border-border/60 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={sectionId} onValueChange={setSectionId}>
                        <SelectTrigger className="w-full" aria-label="Select class">
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {sectionOptions.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {formatSectionLabel(item.classLevel, item.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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

            {!classViewEnabled && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    Select a class to view attendance and summary.
                </p>
            )}

            {classViewEnabled && (
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
                        ) : !classDay?.isTaken ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                No attendance recorded for this class on the selected date.
                            </p>
                        ) : (
                            <div className="overflow-hidden rounded-xl border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Roll number</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classRecords.map((record) => (
                                            <TableRow key={record.studentId}>
                                                <TableCell className="font-medium">
                                                    {record.firstName} {record.lastName}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {record.rollNumber}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            record.status === "PRESENT"
                                                                ? "default"
                                                                : "destructive"
                                                        }
                                                    >
                                                        {record.status === "PRESENT"
                                                            ? "Present"
                                                            : "Absent"}
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

            {classSummaryEnabled && (
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
        </div>
    );
}
