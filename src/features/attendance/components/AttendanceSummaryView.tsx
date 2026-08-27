import { useState } from "react";
import type { JSX } from "react";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useClassesList } from "@features/classes";

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

import { useAttendanceSummary } from "../hooks/useAttendance";
import { schoolCurrentMonth } from "../lib/format";

export function AttendanceSummaryView(): JSX.Element {
    const [classId, setClassId] = useState("");
    const [month, setMonth] = useState(schoolCurrentMonth());

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const enabled = Boolean(classId && month);
    const { data: summary = [], isLoading } = useAttendanceSummary({ classId, month }, enabled);

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
                    <Label htmlFor="attendance-summary-month">Month</Label>
                    <input
                        id="attendance-summary-month"
                        type="month"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    />
                </div>
            </div>

            {!enabled && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    Select a class and month to view the summary.
                </p>
            )}

            {enabled && isLoading && (
                <div className="flex items-center justify-center gap-2 py-10">
                    <Spinner />
                    <span className="text-muted-foreground text-sm">Loading...</span>
                </div>
            )}

            {enabled && !isLoading && summary.length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    No attendance data for this class in the selected month.
                </p>
            )}

            {enabled && !isLoading && summary.length > 0 && (
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
                            {summary.map((item) => (
                                <TableRow key={item.studentId}>
                                    <TableCell className="font-medium">
                                        {item.firstName} {item.lastName}
                                    </TableCell>
                                    <TableCell className="text-right">{item.totalDays}</TableCell>
                                    <TableCell className="text-right">{item.present}</TableCell>
                                    <TableCell className="text-right">{item.absent}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {item.percentage}%
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
