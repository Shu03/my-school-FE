import type { JSX } from "react";

import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import type { TeacherAssignment } from "../types/teacher.types";

interface TeacherAssignmentsSectionProps {
    assignments: TeacherAssignment[];
    isLoading: boolean;
    canManage: boolean;
    deletingAssignmentId: string | null;
    onAdd: () => void;
    onDelete: (assignment: TeacherAssignment) => void;
}

export function TeacherAssignmentsSection({
    assignments,
    isLoading,
    canManage,
    deletingAssignmentId,
    onAdd,
    onDelete,
}: TeacherAssignmentsSectionProps): JSX.Element {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Class assignments</CardTitle>
                {canManage && (
                    <Button size="sm" onClick={onAdd}>
                        <Plus className="size-4" />
                        Add assignment
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoading && (
                    <div className="flex items-center gap-2 py-4">
                        <Spinner className="size-4" />
                        <span className="text-muted-foreground text-sm">
                            Loading assignments...
                        </span>
                    </div>
                )}

                {!isLoading && assignments.length === 0 && (
                    <p className="text-muted-foreground py-4 text-sm">No assignments yet.</p>
                )}

                {!isLoading &&
                    assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="border-border/60 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                        >
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-medium">
                                    {assignment.class.name} (Grade {assignment.class.gradeLevel})
                                </span>
                                <Badge variant="secondary">
                                    {assignment.role === "CLASS_TEACHER"
                                        ? "Class teacher"
                                        : "Subject teacher"}
                                </Badge>
                                {assignment.subject && (
                                    <span className="text-muted-foreground">
                                        {assignment.subject.name} ({assignment.subject.code})
                                    </span>
                                )}
                            </div>
                            {canManage && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Delete assignment"
                                    onClick={() => onDelete(assignment)}
                                    disabled={deletingAssignmentId === assignment.id}
                                >
                                    {deletingAssignmentId === assignment.id ? (
                                        <Spinner className="size-4" />
                                    ) : (
                                        <Trash2 className="size-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    ))}
            </CardContent>
        </Card>
    );
}
