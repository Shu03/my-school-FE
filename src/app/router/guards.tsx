import type { JSX } from "react";

import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@constants/routes.constants";

import type { Role } from "@/types/api";

import { useAuthStore, useSessionExpiredListener } from "@features/auth";

import { DashboardLayout } from "@layouts";

export function ProtectedRoute(): JSX.Element {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const forcePasswordChange = useAuthStore((s) => s.forcePasswordChange);
    const isAuthInitializing = useAuthStore((s) => s.isAuthInitializing);

    useSessionExpiredListener();

    // Don't redirect while auth is initializing (bootstrap phase)
    if (isAuthInitializing) {
        return <Outlet />;
    }

    if (!isAuthenticated && !forcePasswordChange) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    if (forcePasswordChange) {
        return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
    }

    return <DashboardLayout />;
}

export function PublicOnlyRoute(): JSX.Element {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const forcePasswordChange = useAuthStore((s) => s.forcePasswordChange);
    const isAuthInitializing = useAuthStore((s) => s.isAuthInitializing);

    // During initialization, allow render to proceed (AuthInitializer shows loading)
    if (isAuthInitializing) {
        return <Outlet />;
    }

    if (forcePasswordChange) {
        return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <Outlet />;
}

export function ChangePasswordRoute(): JSX.Element {
    const forcePasswordChange = useAuthStore((s) => s.forcePasswordChange);
    const firstLoginToken = useAuthStore((s) => s.firstLoginToken);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isAuthInitializing = useAuthStore((s) => s.isAuthInitializing);

    // Block access while initializing
    if (isAuthInitializing) {
        return <Outlet />;
    }

    // Allow if in first-login forced change mode with valid token
    const hasValidFirstLoginContext = forcePasswordChange && firstLoginToken;

    // Allow if authenticated (voluntary change)
    const hasValidVoluntaryChangeContext = isAuthenticated && !forcePasswordChange;

    if (!hasValidFirstLoginContext && !hasValidVoluntaryChangeContext) {
        // Not in a valid password change context, redirect to login or dashboard
        if (isAuthenticated) {
            return <Navigate to={ROUTES.DASHBOARD} replace />;
        }
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <Outlet />;
}

interface RoleGuardProps {
    allowedRoles: Role[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps): JSX.Element {
    const user = useAuthStore((s) => s.user);

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <Outlet />;
}
