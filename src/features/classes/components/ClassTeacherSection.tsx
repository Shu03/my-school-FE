import { useState } from "react";
import type { JSX } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useCreateAssignment } from "@features/teachers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { classesKeys } from "../hooks/useClasses";
import { getAssignmentErrorMessage } from "../lib/errors";
import type { SchoolClassWithRelations } from "../types/class.types";

import { AssignTeacherDialog } from "./AssignTeacherDialog";

interface ClassTeacherSectionProps {
    classId: string;
    classTeacher: SchoolClassWithRelations["classTeacher"];
    canManage: boolean;
}

export function ClassTeacherSection({
    classId,
    classTeacher,
    canManage,
}: ClassTeacherSectionProps): JSX.Element {
    const queryClient = useQueryClient();
    const [assignOpen, setAssignOpen] = useState(false);
    const createAssignment = useCreateAssignment();

    async function handleAssign(teacherId: string): Promise<void> {
        try {
            await createAssignment.mutateAsync({
                id: teacherId,
                data: { classId, role: "CLASS_TEACHER" },
            });
            await queryClient.invalidateQueries({ queryKey: classesKeys.detail(classId) });
            toast.success("Class teacher assigned successfully.");
            setAssignOpen(false);
        } catch (error) {
            toast.error(getAssignmentErrorMessage(error));
        }
    }

    return (
        <Card className="gap-0">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-base">Class teacher</CardTitle>
                {canManage && !classTeacher && (
                    <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
                        <UserPlus className="size-4" />
                        Assign
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {classTeacher ? (
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/12 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl text-base font-semibold">
                            {classTeacher.user.firstName.charAt(0)}
                            {classTeacher.user.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0 space-y-1">
                            <p className="truncate font-semibold">
                                {classTeacher.user.firstName} {classTeacher.user.lastName}
                            </p>
                            <p className="text-muted-foreground font-mono text-xs">
                                {classTeacher.employeeCode}
                            </p>
                            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <span className="flex items-center gap-1.5">
                                    <Phone className="size-3.5" />
                                    <span className="tabular-nums">
                                        {classTeacher.user.mobileNumber}
                                    </span>
                                </span>
                                {classTeacher.user.email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="size-3.5" />
                                        <span className="truncate">{classTeacher.user.email}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted-foreground flex flex-col items-center gap-2 py-6 text-center text-sm">
                        <UserRound className="size-8 opacity-40" />
                        <p>No class teacher assigned yet.</p>
                    </div>
                )}
            </CardContent>

            {canManage && (
                <AssignTeacherDialog
                    open={assignOpen}
                    title="Assign class teacher"
                    description="Select a teacher to be the class teacher for this class."
                    isSubmitting={createAssignment.isPending}
                    onOpenChange={setAssignOpen}
                    onSubmit={handleAssign}
                />
            )}
        </Card>
    );
}
