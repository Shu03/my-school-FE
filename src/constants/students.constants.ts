import { Role } from "@/types/api";

/** Enrollment lifecycle status values (mirrors backend enum). */
export const ENROLLMENT_STATUS = {
    ACTIVE: "ACTIVE",
    PROMOTED: "PROMOTED",
    FAILED: "FAILED",
    TRANSFERRED: "TRANSFERRED",
    WITHDRAWN: "WITHDRAWN",
} as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

/** Ordered status list for selection UIs. */
export const ENROLLMENT_STATUS_LIST: EnrollmentStatus[] = Object.values(ENROLLMENT_STATUS);

/** Human-readable labels for enrollment statuses. */
export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
    ACTIVE: "Active",
    PROMOTED: "Promoted",
    FAILED: "Failed",
    TRANSFERRED: "Transferred",
    WITHDRAWN: "Withdrawn",
};

/** Field length limits for student/enrollment forms (mirrors backend DTO rules). */
export const STUDENT_VALIDATION = {
    ADMISSION_NUMBER_MAX: 20,
    ROLL_NUMBER_MAX: 10,
    SEARCH_MAX: 100,
} as const;

/** Pagination defaults and bounds for the student list (mirrors backend). */
export const STUDENT_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/** Roles that may open the students list (backend scopes teacher results). */
export const STUDENTS_VIEW_ROLES: Role[] = [Role.ADMIN, Role.TEACHER];
