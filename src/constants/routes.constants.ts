/**
 * Application route paths.
 * Single source of truth for navigation targets.
 */
export const ROUTES = {
    LOGIN: "/login",
    CHANGE_PASSWORD: "/change-password",
    DASHBOARD: "/",
    USERS: "/users",
    STUDENTS: "/students",
    CLASSES: "/classes",
    SETTINGS: "/settings",
    NOT_FOUND: "*",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
