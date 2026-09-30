import type { ComponentType, JSX, ReactNode } from "react";

import { Link } from "react-router-dom";

import { CalendarX2, Clock, RotateCcw, ServerCrash, ShieldAlert } from "lucide-react";

import { DASHBOARD_MESSAGES } from "@constants/dashboard.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DashboardErrorKind } from "../lib/errors";
import type { Tone } from "../lib/format";
import { TONE_TINT } from "../lib/tone";

interface ErrorPanelProps {
    icon: ComponentType<{ className?: string }>;
    tone: Tone;
    title: string;
    message: string;
    children?: ReactNode;
}

function ErrorPanel({ icon: Icon, tone, title, message, children }: ErrorPanelProps): JSX.Element {
    return (
        <div
            role="alert"
            className="border-border/70 bg-muted/20 mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center"
        >
            <span
                className={cn(
                    "texture-sheen flex size-14 items-center justify-center rounded-2xl ring-1",
                    TONE_TINT[tone],
                )}
            >
                <Icon className="size-7" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="text-muted-foreground max-w-md text-sm">{message}</p>
            {children ? (
                <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>
            ) : null}
        </div>
    );
}

function RetryButton({
    onRetry,
    isRetrying,
    label,
}: {
    onRetry: () => void;
    isRetrying: boolean;
    label: string;
}): JSX.Element {
    return (
        <Button onClick={onRetry} disabled={isRetrying}>
            <RotateCcw
                className={cn("size-4", isRetrying && "animate-spin motion-reduce:animate-none")}
            />
            {isRetrying ? "Retrying…" : label}
        </Button>
    );
}

interface DashboardErrorStateProps {
    kind: Exclude<DashboardErrorKind, "unauthorized">;
    serverMessage?: string;
    role: Role | undefined;
    onRetry: () => void;
    isRetrying: boolean;
}

export function DashboardErrorState({
    kind,
    serverMessage,
    role,
    onRetry,
    isRetrying,
}: DashboardErrorStateProps): JSX.Element {
    switch (kind) {
        case "profileMissing":
            return (
                <ErrorPanel
                    icon={ShieldAlert}
                    tone="destructive"
                    title={serverMessage ?? DASHBOARD_MESSAGES.PROFILE_MISSING}
                    message={DASHBOARD_MESSAGES.CONTACT_ADMIN}
                />
            );
        case "noAcademicYear":
            return role === Role.ADMIN ? (
                <ErrorPanel
                    icon={CalendarX2}
                    tone="warning"
                    title="No current academic year"
                    message={serverMessage ?? DASHBOARD_MESSAGES.NO_ACADEMIC_YEAR_ADMIN}
                >
                    <Button asChild>
                        <Link to={ROUTES.ACADEMIC_YEARS_MANAGE}>Manage academic years</Link>
                    </Button>
                </ErrorPanel>
            ) : (
                <ErrorPanel
                    icon={CalendarX2}
                    tone="info"
                    title="School year not set up"
                    message={DASHBOARD_MESSAGES.NO_ACADEMIC_YEAR_MEMBER}
                />
            );
        case "rateLimited":
            return (
                <ErrorPanel
                    icon={Clock}
                    tone="warning"
                    title="Slow down a little"
                    message={DASHBOARD_MESSAGES.RATE_LIMITED}
                >
                    <RetryButton onRetry={onRetry} isRetrying={isRetrying} label="Try again" />
                </ErrorPanel>
            );
        case "generic":
            return (
                <ErrorPanel
                    icon={ServerCrash}
                    tone="destructive"
                    title="Something went wrong"
                    message={DASHBOARD_MESSAGES.GENERIC}
                >
                    <RetryButton onRetry={onRetry} isRetrying={isRetrying} label="Retry" />
                </ErrorPanel>
            );
    }
}
