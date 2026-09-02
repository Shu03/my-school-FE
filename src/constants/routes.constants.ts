/**
 * Application route paths.
 * Single source of truth for navigation targets.
 */
export const ROUTES = {
    LOGIN: "/login",
    CHANGE_PASSWORD: "/change-password",
    DASHBOARD: "/",
    PROFILE: "/profile",
    USERS: "/users",
    USER_NEW: "/users/new",
    USER_EDIT: "/users/:id/edit",
    ACADEMIC_YEARS: "/academic-years",
    ACADEMIC_YEARS_MANAGE: "/academic-years/manage",
    ACADEMIC_YEAR_TERMS: "/academic-years/:id/terms",
    STUDENTS: "/students",
    STUDENT_DETAIL: "/students/:id",
    CLASSES: "/classes",
    CLASS_DETAIL: "/classes/sections/:id",
    SUBJECTS: "/subjects",
    TEACHERS: "/teachers",
    TEACHER_DETAIL: "/teachers/:id",
    ATTENDANCE: "/attendance",
    HOMEWORK: "/homework",
    ANNOUNCEMENTS: "/announcements",
    EXAMS: "/exams",
    EXAM_DETAIL: "/exams/:id",
    FEES: "/fees",
    FEE_DETAIL: "/fees/records/:id",
    MY_FEES: "/my-fees",
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

/** Build the detail path for a specific teacher. */
export function teacherDetail(id: string): string {
    return `/teachers/${id}`;
}

/** Build the detail path for a specific student. */
export function studentDetail(id: string): string {
    return `/students/${id}`;
}

/** Build the detail path for a specific class. */
export function classDetail(id: string): string {
    return `/classes/sections/${id}`;
}

/** Build the detail path for a specific exam. */
export function examDetail(id: string): string {
    return `/exams/${id}`;
}

/** Build the detail path for a specific fee record. */
export function feeDetail(id: string): string {
    return `/fees/records/${id}`;
}
