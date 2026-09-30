import type { JSX } from "react";

import { Role } from "@/types/api";

import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton(): JSX.Element {
    return (
        <div className="ring-foreground/10 rounded-xl p-5 ring-1">
            <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-32" />
        </div>
    );
}

function CardSkeleton({ rows = 3 }: { rows?: number }): JSX.Element {
    return (
        <div className="ring-foreground/10 overflow-hidden rounded-xl ring-1">
            <div className="border-border/60 flex items-center gap-3 border-b px-5 py-4">
                <Skeleton className="size-9 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="flex flex-col gap-4 px-5 py-4">
                {Array.from({ length: rows }, (_, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Skeleton className="size-12 rounded-lg" />
                        <div className="flex flex-1 flex-col gap-1.5">
                            <Skeleton className="h-4 w-3/5" />
                            <Skeleton className="h-3 w-2/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const STAT_COUNT = 4;

/** Mirrors each role's grid so the layout doesn't jump when data arrives. */
export function DashboardSkeleton({ role }: { role: Role | undefined }): JSX.Element {
    const isStudent = role === Role.STUDENT;

    return (
        <div className="flex flex-col gap-6" aria-hidden="true">
            {isStudent ? (
                <Skeleton className="h-22 w-full rounded-xl" />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: STAT_COUNT }, (_, index) => (
                        <StatSkeleton key={index} />
                    ))}
                </div>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <CardSkeleton rows={4} />
                <CardSkeleton rows={4} />
            </div>
            <div
                className={
                    role === Role.ADMIN
                        ? "grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
                        : "grid gap-6 lg:grid-cols-2"
                }
            >
                <CardSkeleton />
                <CardSkeleton />
                {role === Role.ADMIN ? <CardSkeleton /> : null}
            </div>
        </div>
    );
}
