import type { JSX, ReactNode } from "react";
import { lazy, Suspense } from "react";

import { Spinner } from "@/components/ui/spinner";

export const LoginPage = lazy(() =>
    import("@features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
export const ChangePasswordPage = lazy(() =>
    import("@features/auth/pages/ChangePasswordPage").then((m) => ({
        default: m.ChangePasswordPage,
    })),
);
export const DashboardPage = lazy(() =>
    import("@features/dashboard/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
export const UsersPage = lazy(() =>
    import("@features/users/pages/UsersPage").then((m) => ({ default: m.UsersPage })),
);

function PageLoader(): JSX.Element {
    return (
        <div className="flex min-h-svh items-center justify-center">
            <Spinner className="size-6" />
        </div>
    );
}

export function Lazy({ children }: { children: ReactNode }): JSX.Element {
    return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}
