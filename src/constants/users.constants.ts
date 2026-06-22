import { Role } from "@/types/api";

/** Field length limits for user create/update forms (mirrors backend DTO rules). */
export const USER_VALIDATION = {
    NAME_MAX: 50,
    EMAIL_MAX: 255,
    EMPLOYEE_CODE_MAX: 20,
    ADMISSION_NUMBER_MAX: 20,
    SEARCH_MAX: 100,
} as const;

/** Pagination defaults and bounds for the user list (mirrors backend). */
export const USER_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/** Human-friendly labels for each role. */
export const ROLE_LABELS: Record<Role, string> = {
    [Role.ADMIN]: "Admin",
    [Role.TEACHER]: "Teacher",
    [Role.STUDENT]: "Student",
};

/** The roles an admin can create, in display order. */
export const CREATABLE_ROLES: Role[] = [Role.ADMIN, Role.TEACHER, Role.STUDENT];
