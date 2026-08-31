import type { JSX } from "react";

import { Pencil, Plus } from "lucide-react";

import { ENROLLMENT_STATUS } from "@constants/students.constants";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import type { StudentEnrollment } from "../types/student.types";

import { EnrollmentStatusBadge } from "./EnrollmentStatusBadge";

interface EnrollmentsSectionProps {
    enrollments: StudentEnrollment[];
    isLoading: boolean;
    canManage: boolean;
    onEnroll: () => void;
    onEdit: (enrollment: StudentEnrollment) => void;
}

export function EnrollmentsSection({
    enrollments,
    isLoading,
    canManage,
    onEnroll,
    onEdit,
}: EnrollmentsSectionProps): JSX.Element {
    const hasActiveEnrollment = enrollments.some(
        (enrollment) => enrollment.status === ENROLLMENT_STATUS.ACTIVE,
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Enrollments</CardTitle>
                {canManage && !hasActiveEnrollment && (
                    <Button size="sm" onClick={onEnroll}>
                        <Plus className="size-4" />
                        Enroll
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoading && (
                    <div className="flex items-center gap-2 py-4">
                        <Spinner className="size-4" />
                        <span className="text-muted-foreground text-sm">
                            Loading enrollments...
                        </span>
                    </div>
                )}

                {!isLoading && enrollments.length === 0 && (
                    <p className="text-muted-foreground py-4 text-sm">No enrollments yet.</p>
                )}

                {!isLoading &&
                    enrollments.map((enrollment) => (
                        <div
                            key={enrollment.id}
                            className="border-border/60 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                        >
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-medium">
                                    {enrollment.class.name} (Grade {enrollment.class.gradeLevel})
                                </span>
                                <span className="text-muted-foreground">
                                    {enrollment.academicYear.name}
                                </span>
                                <span className="text-muted-foreground">
                                    Roll #{enrollment.rollNumber}
                                </span>
                                <EnrollmentStatusBadge status={enrollment.status} />
                            </div>
                            {canManage && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Edit enrollment"
                                    onClick={() => onEdit(enrollment)}
                                >
                                    <Pencil className="size-4" />
                                </Button>
                            )}
                        </div>
                    ))}
            </CardContent>
        </Card>
    );
}
