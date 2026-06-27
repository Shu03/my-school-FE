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
export const UserCreatePage = lazy(() =>
    import("@features/users/pages/UserCreatePage").then((m) => ({ default: m.UserCreatePage })),
);
export const UserEditPage = lazy(() =>
    import("@features/users/pages/UserEditPage").then((m) => ({ default: m.UserEditPage })),
);
export const AcademicYearsPage = lazy(() =>
    import("@features/academic-years/pages/AcademicYearsPage").then((m) => ({
        default: m.AcademicYearsPage,
    })),
);
export const ManageAcademicYearsPage = lazy(() =>
    import("@features/academic-years/pages/ManageAcademicYearsPage").then((m) => ({
        default: m.ManageAcademicYearsPage,
    })),
);
export const AcademicYearTermsPage = lazy(() =>
    import("@features/academic-years/pages/AcademicYearTermsPage").then((m) => ({
        default: m.AcademicYearTermsPage,
    })),
);
export const ClassesPage = lazy(() =>
    import("@features/classes/pages/ClassesPage").then((m) => ({
        default: m.ClassesPage,
    })),
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
