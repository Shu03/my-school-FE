import { useState } from "react";
import type { JSX } from "react";

import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from "@constants/attendance.constants";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useClassesList } from "@features/classes";

import { Badge } from "@/components/ui/badge";
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

import { useClassAttendance } from "../hooks/useAttendance";
import { schoolToday } from "../lib/format";

export function ClassAttendanceView(): JSX.Element {
    const [classId, setClassId] = useState("");
    const [date, setDate] = useState(schoolToday());

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const enabled = Boolean(classId && date);
    const { data: records = [], isLoading } = useClassAttendance({ classId, date }, enabled);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={classId} onValueChange={setClassId}>
                        <SelectTrigger className="w-56" aria-label="Select class">
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.name} (Grade {item.gradeLevel})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="attendance-view-date">Date</Label>
                    <input
                        id="attendance-view-date"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    />
                </div>
            </div>

            {!enabled && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    Select a class and date to view attendance.
                </p>
            )}

            {enabled && isLoading && (
                <div className="flex items-center justify-center gap-2 py-10">
                    <Spinner />
                    <span className="text-muted-foreground text-sm">Loading...</span>
                </div>
            )}

            {enabled && !isLoading && records.length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    No attendance recorded for this class on the selected date.
                </p>
            )}

            {enabled && !isLoading && records.length > 0 && (
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
                            {records.map((record) => (
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
                                                record.status === ATTENDANCE_STATUS.PRESENT
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
        </div>
    );
}
