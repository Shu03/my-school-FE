import { createBrowserRouter } from "react-router-dom";

import { Role } from "@/types";

import { ChangePasswordPage } from "@/features/auth/ChangePasswordPage";
import { DashboardPage } from "@/features/auth/DashboardPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { UsersPage } from "@/features/users/UsersPage";

import { ProtectedRoute, PublicOnlyRoute, RoleGuard } from "./guards";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
    // Public routes (redirect to dashboard if already logged in)
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
        ],
    },

    // Semi-public: force password change (needs firstLoginToken, not full auth)
    {
        path: "/change-password",
        element: <ChangePasswordPage />,
    },

    // Protected routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <DashboardPage />,
            },

            // Admin-only routes
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN]} />,
                children: [
                    {
                        path: "/users",
                        element: <UsersPage />,
                    },
                ],
            },
        ],
    },

    // Catch-all
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);
