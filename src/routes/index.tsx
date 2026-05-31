import { createBrowserRouter } from "react-router-dom";

import { Role } from "@/types";

import { ProtectedRoute, PublicOnlyRoute, RoleGuard } from "./guards";
import { ChangePasswordPage, DashboardPage, Lazy, LoginPage, UsersPage } from "./lazy";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
    // Public routes (redirect to dashboard if already logged in)
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: "/login",
                element: (
                    <Lazy>
                        <LoginPage />
                    </Lazy>
                ),
            },
        ],
    },

    // Semi-public: force password change (needs firstLoginToken, not full auth)
    {
        path: "/change-password",
        element: (
            <Lazy>
                <ChangePasswordPage />
            </Lazy>
        ),
    },

    // Protected routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: (
                    <Lazy>
                        <DashboardPage />
                    </Lazy>
                ),
            },

            // Admin-only routes
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN]} />,
                children: [
                    {
                        path: "/users",
                        element: (
                            <Lazy>
                                <UsersPage />
                            </Lazy>
                        ),
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
