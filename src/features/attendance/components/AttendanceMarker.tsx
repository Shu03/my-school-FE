import { useState } from "react";
import type { JSX } from "react";

import { toast } from "sonner";

import {
    ATTENDANCE_STATUS,
    ATTENDANCE_STUDENT_LIMIT,
    type AttendanceStatus,
} from "@constants/attendance.constants";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useClassesList } from "@features/classes";
import { useStudentsList } from "@features/students";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

import { useMarkAttendance } from "../hooks/useAttendance";
import { getAttendanceErrorMessage } from "../lib/errors";
import { schoolToday } from "../lib/format";

export function AttendanceMarker(): JSX.Element {
    const today = schoolToday();

    const [classId, setClassId] = useState("");
    const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
    const [syncKey, setSyncKey] = useState("");

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const { data: studentsData, isLoading } = useStudentsList({
        classId: classId || undefined,
        academicYearId: currentYear?.id,
        limit: ATTENDANCE_STUDENT_LIMIT,
    });
    const students = classId ? (studentsData?.data ?? []) : [];

    const markMutation = useMarkAttendance();

    // Initialize every student to PRESENT whenever the loaded roster changes (render-time sync).
    const rosterKey = `${classId}:${students.map((student) => student.id).join(",")}`;
    if (rosterKey !== syncKey) {
        setSyncKey(rosterKey);
        setStatuses(
            Object.fromEntries(students.map((student) => [student.id, ATTENDANCE_STATUS.PRESENT])),
        );
    }

    function setStatus(studentId: string, status: AttendanceStatus): void {
        setStatuses((current) => ({ ...current, [studentId]: status }));
    }

    function markAllPresent(): void {
        setStatuses(
            Object.fromEntries(students.map((student) => [student.id, ATTENDANCE_STATUS.PRESENT])),
        );
    }

    async function handleSubmit(): Promise<void> {
        if (!classId || students.length === 0) {
            return;
        }

        try {
            const result = await markMutation.mutateAsync({
                classId,
                date: today,
                records: students.map((student) => ({
                    studentId: student.id,
                    status: statuses[student.id] ?? ATTENDANCE_STATUS.PRESENT,
                })),
            });
            toast.success(`Attendance marked for ${result.marked} students.`);
        } catch (error) {
            toast.error(getAttendanceErrorMessage(error));
        }
    }

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
                <div className="text-muted-foreground text-sm">
                    Date: <span className="font-medium">{today}</span> (today only)
                </div>
            </div>

            {!classId && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    Select a class to mark attendance.
                </p>
            )}

            {classId && isLoading && (
                <div className="flex items-center justify-center gap-2 py-10">
                    <Spinner />
                    <span className="text-muted-foreground text-sm">Loading students...</span>
                </div>
            )}

            {classId && !isLoading && students.length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    No active students enrolled in this class.
                </p>
            )}

            {classId && !isLoading && students.length > 0 && (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">{students.length} students</p>
                        <Button type="button" variant="outline" size="sm" onClick={markAllPresent}>
                            Mark all present
                        </Button>
                    </div>

                    <div className="divide-border/60 divide-y rounded-xl border">
                        {students.map((student) => {
                            const status = statuses[student.id] ?? ATTENDANCE_STATUS.PRESENT;
                            return (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                                >
                                    <div className="text-sm">
                                        <span className="font-medium">
                                            {student.user.firstName} {student.user.lastName}
                                        </span>
                                        <span className="text-muted-foreground ml-2 font-mono text-xs">
                                            {student.admissionNumber}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={
                                                status === ATTENDANCE_STATUS.PRESENT
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setStatus(student.id, ATTENDANCE_STATUS.PRESENT)
                                            }
                                        >
                                            Present
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={
                                                status === ATTENDANCE_STATUS.ABSENT
                                                    ? "destructive"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                setStatus(student.id, ATTENDANCE_STATUS.ABSENT)
                                            }
                                        >
                                            Absent
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            disabled={markMutation.isPending}
                            onClick={() => void handleSubmit()}
                        >
                            {markMutation.isPending && <Spinner />}
                            Submit attendance
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
