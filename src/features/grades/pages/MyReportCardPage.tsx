import type { JSX } from "react";

import { Award } from "lucide-react";

import { useAuthStore } from "@features/auth";
import { StudentGradeHistoryCard } from "@features/grades";

import { Alert, AlertDescription } from "@/components/ui/alert";

// Placeholder summary — no report-summary endpoint exists yet.
const REPORT_SUMMARY = {
    term: "Term 1",
    overallPercentage: 82,
    rank: 6,
    classSize: 34,
    grade: "A",
};

export function MyReportCardPage(): JSX.Element {
    const studentProfileId = useAuthStore((s) => s.user?.studentProfileId ?? null);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-center gap-4">
                        <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                            <Award className="size-5" />
                        </span>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">Report card</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Your exam results and academic performance.
                            </p>
                        </div>
                    </div>
                </div>
                <dl className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-3">
                    <div className="border-border/60 bg-muted/25 rounded-lg border px-4 py-3">
                        <dt className="text-muted-foreground text-xs">Overall ({REPORT_SUMMARY.term})</dt>
                        <dd className="mt-1 text-2xl font-bold tabular-nums">
                            {REPORT_SUMMARY.overallPercentage}%
                        </dd>
                    </div>
                    <div className="border-border/60 bg-muted/25 rounded-lg border px-4 py-3">
                        <dt className="text-muted-foreground text-xs">Class rank</dt>
                        <dd className="mt-1 text-2xl font-bold tabular-nums">
                            {REPORT_SUMMARY.rank}
                            <span className="text-muted-foreground text-base font-medium">
                                {" "}
                                / {REPORT_SUMMARY.classSize}
                            </span>
                        </dd>
                    </div>
                    <div className="border-border/60 bg-muted/25 rounded-lg border px-4 py-3">
                        <dt className="text-muted-foreground text-xs">Grade</dt>
                        <dd className="mt-1 text-2xl font-bold">{REPORT_SUMMARY.grade}</dd>
                    </div>
                </dl>
            </div>

            {studentProfileId ? (
                <StudentGradeHistoryCard studentId={studentProfileId} />
            ) : (
                <Alert>
                    <AlertDescription>
                        No student profile is linked to your account.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
