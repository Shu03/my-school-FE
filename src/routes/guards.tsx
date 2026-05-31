import type { JSX } from "react";

import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";
import { DashboardLayout } from "@/layouts";

import { useSessionExpiredListener } from "@/hooks/useSessionExpiredListener";

import type { Role } from "@/types";

export function ProtectedRoute(): JSX.Element {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const forcePasswordChange = useAuthStore((s) => s.forcePasswordChange);

    useSessionExpiredListener();

    if (!isAuthenticated && !forcePasswordChange) {
        return <Navigate to="/login" replace />;
    }

    if (forcePasswordChange) {
        return <Navigate to="/change-password" replace />;
    }

    return <DashboardLayout />;
}

export function PublicOnlyRoute(): JSX.Element {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const forcePasswordChange = useAuthStore((s) => s.forcePasswordChange);

    if (forcePasswordChange) {
        return <Navigate to="/change-password" replace />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

interface RoleGuardProps {
    allowedRoles: Role[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps): JSX.Element {
    const user = useAuthStore((s) => s.user);

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
