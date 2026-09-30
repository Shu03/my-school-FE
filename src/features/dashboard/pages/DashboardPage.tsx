import type { JSX } from "react";

import { AlertCircle, RotateCcw } from "lucide-react";

import { DASHBOARD_MESSAGES } from "@constants/dashboard.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { AdminDashboardView } from "../components/AdminDashboardView";
import { DashboardErrorState } from "../components/DashboardErrorState";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { StudentDashboardView } from "../components/StudentDashboardView";
import { TeacherDashboardView } from "../components/TeacherDashboardView";
import { useDashboard } from "../hooks/useDashboard";
import { getDashboardErrorKind, getServerMessage } from "../lib/errors";
import type { DashboardResponse } from "../types/dashboard.types";

function DashboardView({ data }: { data: DashboardResponse }): JSX.Element {
    switch (data.role) {
        case Role.ADMIN:
            return <AdminDashboardView data={data} />;
        case Role.TEACHER:
            return <TeacherDashboardView data={data} />;
        case Role.STUDENT:
            return <StudentDashboardView data={data} />;
        default: {
            const unreachable: never = data;
            return unreachable;
        }
    }
}

export function DashboardPage(): JSX.Element {
    const role = useAuthStore((s) => s.user?.role);
    const { data, error, isPending, isFetching, refetch } = useDashboard();
    const errorKind = error ? getDashboardErrorKind(error) : null;

    function refresh(): void {
        void refetch();
    }

    let body: JSX.Element | null = null;
    if (data) {
        body = <DashboardView data={data} />;
    } else if (errorKind && errorKind !== "unauthorized") {
        // 401 is left to the API client's refresh / session-expired flow.
        body = (
            <DashboardErrorState
                kind={errorKind}
                serverMessage={getServerMessage(error)}
                role={role}
                onRetry={refresh}
                isRetrying={isFetching}
            />
        );
    } else if (isPending) {
        body = <DashboardSkeleton role={role} />;
    }

    return (
        <div className="flex flex-col gap-6" aria-busy={isFetching}>
            <DashboardHeader
                role={role}
                yearName={data?.academicYear.name}
                today={data?.today}
                isRefreshing={isFetching}
                onRefresh={data ? refresh : undefined}
            />

            {data && error ? (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>
                        {errorKind === "rateLimited"
                            ? DASHBOARD_MESSAGES.RATE_LIMITED
                            : DASHBOARD_MESSAGES.GENERIC}{" "}
                        Showing the last loaded data.
                    </AlertDescription>
                    <AlertAction>
                        <Button size="sm" variant="outline" onClick={refresh} disabled={isFetching}>
                            <RotateCcw className="size-3.5" />
                            Try again
                        </Button>
                    </AlertAction>
                </Alert>
            ) : null}

            {body}
        </div>
    );
}
