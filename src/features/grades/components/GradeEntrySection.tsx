import { useState } from "react";
import type { JSX } from "react";

import { toast } from "sonner";

import { GRADE_STUDENT_LIMIT } from "@constants/exams.constants";

import { useStudentsList } from "@features/students";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useEnterGrades, useExamSubjectGrades } from "../hooks/useGrades";
import { getGradeErrorMessage } from "../lib/errors";

interface GradeEntrySectionProps {
    examId: string;
    subjectId: string;
    classId: string;
    academicYearId: string;
    totalMarks: number;
}

export function GradeEntrySection({
    examId,
    subjectId,
    classId,
    academicYearId,
    totalMarks,
}: GradeEntrySectionProps): JSX.Element {
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [syncKey, setSyncKey] = useState("");

    const { data: studentsData, isLoading: isLoadingStudents } = useStudentsList({
        classId,
        academicYearId,
        limit: GRADE_STUDENT_LIMIT,
    });
    const students = studentsData?.data ?? [];

    const { data: existingGrades = [], isLoading: isLoadingGrades } = useExamSubjectGrades(
        examId,
        subjectId,
    );

    const enterMutation = useEnterGrades(examId, subjectId);

    // Prefill marks from existing grades whenever the roster or grade set changes (render-time sync).
    const dataKey = `${students.map((student) => student.id).join(",")}|${existingGrades
        .map((grade) => `${grade.studentId}:${grade.marksObtained}`)
        .join(",")}`;
    if (dataKey !== syncKey) {
        setSyncKey(dataKey);
        const gradeByStudent = new Map(
            existingGrades.map((grade) => [grade.studentId, String(grade.marksObtained)]),
        );
        setMarks(
            Object.fromEntries(
                students.map((student) => [student.id, gradeByStudent.get(student.id) ?? ""]),
            ),
        );
    }

    function setMark(studentId: string, value: string): void {
        setMarks((current) => ({ ...current, [studentId]: value }));
    }

    async function handleSubmit(): Promise<void> {
        const records = students
            .filter(
                (student) => marks[student.id]?.trim() !== "" && marks[student.id] !== undefined,
            )
            .map((student) => ({
                studentId: student.id,
                marksObtained: Number(marks[student.id]),
            }));

        if (records.length === 0) {
            toast.error("Enter marks for at least one student.");
            return;
        }

        const invalid = records.some(
            (record) =>
                Number.isNaN(record.marksObtained) ||
                record.marksObtained < 0 ||
                record.marksObtained > totalMarks,
        );

        if (invalid) {
            toast.error(`Marks must be between 0 and ${totalMarks}.`);
            return;
        }

        try {
            const result = await enterMutation.mutateAsync({ records });
            toast.success(`Grades saved for ${result.entered} students.`);
        } catch (error) {
            toast.error(getGradeErrorMessage(error));
        }
    }

    if (isLoadingStudents || isLoadingGrades) {
        return (
            <div className="flex items-center justify-center gap-2 py-10">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading roster...</span>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <p className="text-muted-foreground py-6 text-center text-sm">
                No active students enrolled in this class.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Admission #</TableHead>
                            <TableHead className="w-40 text-right">Marks (/{totalMarks})</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">
                                    {student.user.firstName} {student.user.lastName}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                    {student.admissionNumber}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={totalMarks}
                                        value={marks[student.id] ?? ""}
                                        onChange={(event) =>
                                            setMark(student.id, event.target.value)
                                        }
                                        className="ml-auto w-28 text-right"
                                        aria-label={`Marks for ${student.user.firstName} ${student.user.lastName}`}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    disabled={enterMutation.isPending}
                    onClick={() => void handleSubmit()}
                >
                    {enterMutation.isPending && <Spinner />}
                    Save grades
                </Button>
            </div>
        </div>
    );
}
