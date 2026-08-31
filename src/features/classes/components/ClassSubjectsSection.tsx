import { useState } from "react";
import type { JSX } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { subjectsKeys, useSubject, useSubjectsList } from "@features/subjects";
import type { Subject } from "@features/subjects";
import { useCreateAssignment } from "@features/teachers";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { getAssignmentErrorMessage } from "../lib/errors";

import { AssignTeacherDialog } from "./AssignTeacherDialog";

interface ClassSubjectsSectionProps {
    classId: string;
    gradeLevel: number;
    canManage: boolean;
}

export function ClassSubjectsSection({
    classId,
    gradeLevel,
    canManage,
}: ClassSubjectsSectionProps): JSX.Element {
    const { data: subjects = [], isLoading } = useSubjectsList({ gradeLevel });

    return (
        <Card className="gap-0">
            <CardHeader>
                <CardTitle className="text-base">
                    Subjects &amp; teachers
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                        Grade {gradeLevel}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
                        <Spinner />
                        <span>Loading subjects…</span>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm">
                        <BookOpen className="size-8 opacity-40" />
                        <p>No subjects defined for this grade yet.</p>
                    </div>
                ) : (
                    <ul className="divide-border/60 divide-y">
                        {subjects.map((subject) => (
                            <ClassSubjectRow
                                key={subject.id}
                                classId={classId}
                                subject={subject}
                                canManage={canManage}
                            />
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

interface ClassSubjectRowProps {
    classId: string;
    subject: Subject;
    canManage: boolean;
}

function ClassSubjectRow({ classId, subject, canManage }: ClassSubjectRowProps): JSX.Element {
    const queryClient = useQueryClient();
    const [assignOpen, setAssignOpen] = useState(false);
    const createAssignment = useCreateAssignment();

    const { data: subjectDetail, isLoading } = useSubject(subject.id);

    const assignment = subjectDetail?.teacherAssignments.find(
        (item) => item.class.id === classId && item.role === "SUBJECT_TEACHER",
    );

    async function handleAssign(teacherId: string): Promise<void> {
        try {
            await createAssignment.mutateAsync({
                id: teacherId,
                data: { classId, role: "SUBJECT_TEACHER", subjectId: subject.id },
            });
            await queryClient.invalidateQueries({ queryKey: subjectsKeys.detail(subject.id) });
            toast.success("Subject teacher assigned successfully.");
            setAssignOpen(false);
        } catch (error) {
            toast.error(getAssignmentErrorMessage(error));
        }
    }

    return (
        <li className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 items-center gap-3">
                <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <BookOpen className="size-4" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{subject.name}</p>
                    <Badge variant="secondary" className="mt-0.5 font-mono text-[0.65rem]">
                        {subject.code}
                    </Badge>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 text-right">
                {isLoading ? (
                    <Spinner className="size-4" />
                ) : assignment ? (
                    <div className="min-w-0">
                        <p className="text-muted-foreground text-[0.7rem] tracking-wide uppercase">
                            Teacher
                        </p>
                        <p className="truncate text-sm font-medium">
                            {assignment.teacher.user.firstName} {assignment.teacher.user.lastName}
                        </p>
                    </div>
                ) : (
                    <>
                        <span className="text-muted-foreground/70 text-xs">Unassigned</span>
                        {canManage && (
                            <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
                                <UserPlus className="size-4" />
                                Assign
                            </Button>
                        )}
                    </>
                )}
            </div>

            {canManage && (
                <AssignTeacherDialog
                    open={assignOpen}
                    title={`Assign teacher — ${subject.name}`}
                    description="Select a teacher to teach this subject for this class."
                    isSubmitting={createAssignment.isPending}
                    onOpenChange={setAssignOpen}
                    onSubmit={handleAssign}
                />
            )}
        </li>
    );
}
