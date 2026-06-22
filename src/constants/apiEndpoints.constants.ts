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
} as const;
