/**
 * Backend API endpoint paths, relative to the configured API base URL.
 */
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REFRESH: "/auth/refresh",
        LOGOUT: "/auth/logout",
        CHANGE_PASSWORD: "/auth/change-password",
        RESET_PASSWORD: "/auth/admin/reset-password",
        ME: "/auth/me",
    },
    USERS: {
        BASE: "/users",
        ADMIN: "/users/admin",
        TEACHER: "/users/teacher",
        STUDENT: "/users/student",
        byId: (id: string) => `/users/${id}`,
        activate: (id: string) => `/users/${id}/activate`,
        deactivate: (id: string) => `/users/${id}/deactivate`,
    },
    ACADEMIC_YEARS: {
        BASE: "/academic-years",
        CURRENT: "/academic-years/current",
        byId: (id: string) => `/academic-years/${id}`,
        setCurrent: (id: string) => `/academic-years/${id}/set-current`,
        terms: (id: string) => `/academic-years/${id}/terms`,
        termById: (id: string, termId: string) => `/academic-years/${id}/terms/${termId}`,
    },
    CLASSES: {
        BASE: "/classes",
        byId: (id: string) => `/classes/${id}`,
        assignTeacher: (id: string) => `/classes/${id}/assign-teacher`,
        removeTeacher: (id: string) => `/classes/${id}/remove-teacher`,
    },
    TEACHERS: {
        BASE: "/teachers",
    },
} as const;
