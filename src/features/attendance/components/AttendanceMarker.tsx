import { useState } from "react";
import type { JSX } from "react";

import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Role } from "@/types/api";

import { formatSectionLabel } from "@lib/section";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";
import { isClassTeacherForSection, useTeacherAccess } from "@features/request-access";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
    useAttendanceDay,
    useDeleteAttendanceDay,
    useSaveAttendanceDay,
} from "../hooks/useAttendance";
import { getAttendanceErrorMessage } from "../lib/errors";
import { schoolToday } from "../lib/format";

interface AttendanceMarkerProps {
    initialSectionId?: string;
}

export function AttendanceMarker({ initialSectionId }: AttendanceMarkerProps): JSX.Element {
    const today = schoolToday();

    const [sectionId, setSectionId] = useState(initialSectionId ?? "");
    const [date, setDate] = useState(today);
    const [attendanceDraft, setAttendanceDraft] = useState<{
        key: string;
        absentStudentIds: string[];
    } | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === Role.ADMIN;
    const isTeacher = user?.role === Role.TEACHER;
    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id) && isAdmin,
    );
    const { assignments = [] } = useTeacherAccess();
    const assignedSections = Array.from(
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
    const sections = isAdmin ? classes : assignedSections;
    const canEdit = isAdmin || (isTeacher && isClassTeacherForSection(assignments, sectionId));
    const dayParams = { sectionId, date };
    const { data: day, isLoading } = useAttendanceDay(dayParams, Boolean(sectionId && date));
    const saveMutation = useSaveAttendanceDay();
    const deleteMutation = useDeleteAttendanceDay();

    const rosterKey = day ? `${day.sectionId}:${day.date}:${day.isTaken}` : "";
    const absentStudentIds =
        attendanceDraft?.key === rosterKey
            ? attendanceDraft.absentStudentIds
            : (day?.students
                  .filter((student) => student.status === "ABSENT")
                  .map((student) => student.studentId) ?? []);

    const minDate = currentYear?.startDate ?? "";
    const maxDate =
        currentYear?.endDate && currentYear.endDate < today ? currentYear.endDate : today;

    async function handleSubmit(): Promise<void> {
        if (!sectionId || !day || !canEdit) {
            return;
        }

        try {
            const result = await saveMutation.mutateAsync({
                params: dayParams,
                data: { absentStudentIds },
            });
            toast.success(result.isTaken ? "Attendance saved." : "Attendance marked.");
        } catch (error) {
            toast.error(getAttendanceErrorMessage(error));
        }
    }

    async function handleDelete(): Promise<void> {
        try {
            await deleteMutation.mutateAsync(dayParams);
            setAttendanceDraft(null);
            setDeleteOpen(false);
            toast.success("Attendance record deleted.");
        } catch (error) {
            toast.error(getAttendanceErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                    <Label>Class</Label>
                    <Select
                        value={sectionId}
                        onValueChange={(value) => {
                            setSectionId(value);
                            setAttendanceDraft(null);
                        }}
                    >
                        <SelectTrigger className="w-56" aria-label="Select class">
                            <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                            {sections.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {formatSectionLabel(item.classLevel, item.name)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="attendance-mark-date">Date</Label>
                    <input
                        id="attendance-mark-date"
                        type="date"
                        value={date}
                        min={minDate}
                        max={maxDate}
                        onChange={(event) => {
                            setDate(event.target.value);
                            setAttendanceDraft(null);
                        }}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    />
                </div>
            </div>

            {!sectionId && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    Select a class to mark attendance.
                </p>
            )}

            {sectionId && isLoading && (
                <div className="flex items-center justify-center gap-2 py-10">
                    <Spinner />
                    <span className="text-muted-foreground text-sm">Loading students...</span>
                </div>
            )}

            {sectionId && !isLoading && day?.students.length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                    No active students enrolled in this section.
                </p>
            )}

            {sectionId && !isLoading && day && (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-muted-foreground text-sm">
                            {day.isTaken ? (
                                <>
                                    Taken
                                    {day.markedBy &&
                                        ` by ${day.markedBy.firstName} ${day.markedBy.lastName}`}
                                    {day.markedAt &&
                                        ` at ${new Date(day.markedAt).toLocaleString()}`}
                                </>
                            ) : (
                                "Not taken"
                            )}
                        </div>
                        <span className="text-muted-foreground text-sm">
                            {day.students.length} students
                        </span>
                    </div>

                    <div className="divide-border/60 divide-y rounded-xl border">
                        {day.students.map((student) => {
                            const isAbsent = absentStudentIds.includes(student.studentId);
                            return (
                                <div
                                    key={student.studentId}
                                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                                >
                                    <div className="text-sm">
                                        <span className="font-medium">
                                            {student.firstName} {student.lastName}
                                        </span>
                                        <span className="text-muted-foreground ml-2 font-mono text-xs">
                                            {student.rollNumber}
                                        </span>
                                    </div>
                                    <ToggleGroup
                                        type="single"
                                        value={isAbsent ? "ABSENT" : "PRESENT"}
                                        onValueChange={(value) => {
                                            if (!canEdit || !value) return;
                                            setAttendanceDraft({
                                                key: rosterKey,
                                                absentStudentIds:
                                                    value === "ABSENT"
                                                        ? [
                                                              ...new Set([
                                                                  ...absentStudentIds,
                                                                  student.studentId,
                                                              ]),
                                                          ]
                                                        : absentStudentIds.filter(
                                                              (id) => id !== student.studentId,
                                                          ),
                                            });
                                        }}
                                        aria-label={`Attendance for ${student.firstName} ${student.lastName}`}
                                        disabled={!canEdit}
                                    >
                                        <ToggleGroupItem
                                            value="PRESENT"
                                            className="data-[state=on]:text-success"
                                        >
                                            <Check />
                                            Present
                                        </ToggleGroupItem>
                                        <ToggleGroupItem
                                            value="ABSENT"
                                            className="data-[state=on]:text-destructive"
                                        >
                                            <X />
                                            Absent
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                            );
                        })}
                    </div>

                    {!canEdit && (
                        <p className="text-muted-foreground text-sm">
                            You can view attendance for this section but cannot edit it.
                        </p>
                    )}
                    {canEdit && (
                        <div className="flex justify-end gap-2">
                            {day.isTaken && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    Delete attendance
                                </Button>
                            )}
                            <Button
                                type="button"
                                disabled={saveMutation.isPending}
                                onClick={() => void handleSubmit()}
                            >
                                {saveMutation.isPending && <Spinner />}
                                {day.isTaken ? "Update attendance" : "Save attendance"}
                            </Button>
                        </div>
                    )}
                </>
            )}

            <ConfirmDialog
                open={deleteOpen}
                title="Delete attendance?"
                description="This removes the attendance record for the selected section and date."
                confirmLabel="Delete"
                isPending={deleteMutation.isPending}
                onOpenChange={setDeleteOpen}
                onConfirm={() => void handleDelete()}
            />
        </div>
    );
}
