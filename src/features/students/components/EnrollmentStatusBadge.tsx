import type { JSX } from "react";

import { ENROLLMENT_STATUS_LABELS, type EnrollmentStatus } from "@constants/students.constants";

import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS: Record<
    EnrollmentStatus,
    "default" | "secondary" | "destructive" | "outline"
> = {
    ACTIVE: "default",
    PROMOTED: "secondary",
    FAILED: "destructive",
    TRANSFERRED: "outline",
    WITHDRAWN: "outline",
};

interface EnrollmentStatusBadgeProps {
    status: EnrollmentStatus;
}

export function EnrollmentStatusBadge({ status }: EnrollmentStatusBadgeProps): JSX.Element {
    return <Badge variant={STATUS_VARIANTS[status]}>{ENROLLMENT_STATUS_LABELS[status]}</Badge>;
}
