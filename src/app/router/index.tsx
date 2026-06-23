import { createBrowserRouter } from "react-router-dom";

import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { ProtectedRoute, PublicOnlyRoute, RoleGuard, ChangePasswordRoute } from "./guards";
import {
    ChangePasswordPage,
    DashboardPage,
    Lazy,
    LoginPage,
    UserCreatePage,
    UserEditPage,
    UsersPage,
} from "./lazy";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
    // Public routes (redirect to dashboard if already logged in)
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: ROUTES.LOGIN,
                element: (
                    <Lazy>
                        <LoginPage />
                    </Lazy>
                ),
            },
        ],
    },

    // Change password route (semi-public: needs firstLoginToken or auth)
    {
        element: <ChangePasswordRoute />,
        children: [
            {
                path: ROUTES.CHANGE_PASSWORD,
                element: (
                    <Lazy>
                        <ChangePasswordPage />
                    </Lazy>
                ),
            },
        ],
    },

    // Protected routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: ROUTES.DASHBOARD,
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
                        path: ROUTES.USERS,
                        element: (
                            <Lazy>
                                <UsersPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.USER_NEW,
                        element: (
                            <Lazy>
                                <UserCreatePage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.USER_EDIT,
                        element: (
                            <Lazy>
                                <UserEditPage />
                            </Lazy>
                        ),
                    },
                ],
            },
        ],
    },

    // Catch-all
    {
        path: ROUTES.NOT_FOUND,
        element: <NotFoundPage />,
    },
]);
