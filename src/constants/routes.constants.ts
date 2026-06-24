/**
 * Application route paths.
 * Single source of truth for navigation targets.
 */
export const ROUTES = {
    LOGIN: "/login",
    CHANGE_PASSWORD: "/change-password",
    DASHBOARD: "/",
    USERS: "/users",
    USER_NEW: "/users/new",
    USER_EDIT: "/users/:id/edit",
    ACADEMIC_YEARS: "/academic-years",
    ACADEMIC_YEAR_TERMS: "/academic-years/:id/terms",
    STUDENTS: "/students",
    CLASSES: "/classes",
    SETTINGS: "/settings",
    NOT_FOUND: "*",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Build the edit path for a specific user. */
export function userEdit(id: string): string {
    return `/users/${id}/edit`;
}

/** Build the terms path for a specific academic year. */
export function academicYearTerms(id: string): string {
    return `/academic-years/${id}/terms`;
}
