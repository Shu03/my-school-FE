import type { JSX } from "react";

import { Link } from "react-router-dom";

import {
    Award,
    CalendarCheck,
    Megaphone,
    NotebookPen,
    Percent,
    Wallet,
} from "lucide-react";

import { ROUTES } from "@constants/routes.constants";

import { HolidaysWidget } from "@features/holidays";

import { Stagger, StaggerItem } from "@components/common/Motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
    RECENT_ANNOUNCEMENTS,
    STUDENT_EXAMS,
    STUDENT_FEE_SUMMARY,
    STUDENT_HOMEWORK,
    STUDENT_REPORT_SUMMARY,
    STUDENT_STATS,
    type StudentHomeworkStatus,
} from "../lib/mockStats";

import { AnnouncementsPreviewList } from "./AnnouncementsPreviewList";
import { DashboardSection } from "./DashboardSection";
import { StatCard } from "./StatCard";
import { WelcomeBanner } from "./WelcomeBanner";

const HOMEWORK_STATUS_STYLES: Record<StudentHomeworkStatus, string> = {
    DUE: "bg-primary/12 text-primary ring-primary/25",
    SUBMITTED: "bg-success/12 text-success ring-success/25",
    OVERDUE: "bg-destructive/10 text-destructive ring-destructive/25",
};

const HOMEWORK_STATUS_LABEL: Record<StudentHomeworkStatus, string> = {
    DUE: "Due",
    SUBMITTED: "Submitted",
    OVERDUE: "Overdue",
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function StudentDashboard(): JSX.Element {
    const fee = STUDENT_FEE_SUMMARY;
    const feeRemaining = Math.max(fee.totalAmount - fee.amountPaid, 0);

    return (
        <div className="space-y-6">
            <WelcomeBanner subtitle="Your academic snapshot for this term." />

            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STUDENT_STATS.map((stat) => (
                    <StaggerItem key={stat.label}>
                        <StatCard stat={stat} />
                    </StaggerItem>
                ))}
            </Stagger>

            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardSection
                    icon={Award}
                    title="Report card"
                    description={`${STUDENT_REPORT_SUMMARY.term} performance`}
                    action={{ label: "View full", to: ROUTES.MY_REPORT_CARD }}
                >
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="border-border/60 bg-muted/25 rounded-lg border px-3 py-3">
                            <p className="text-muted-foreground text-xs">Overall</p>
                            <p className="mt-1 text-xl font-bold tabular-nums">
                                {STUDENT_REPORT_SUMMARY.overallPercentage}%
                            </p>
                        </div>
                        <div className="border-border/60 bg-muted/25 rounded-lg border px-3 py-3">
                            <p className="text-muted-foreground text-xs">Rank</p>
                            <p className="mt-1 text-xl font-bold tabular-nums">
                                {STUDENT_REPORT_SUMMARY.rank}
                            </p>
                        </div>
                        <div className="border-border/60 bg-muted/25 rounded-lg border px-3 py-3">
                            <p className="text-muted-foreground text-xs">Class size</p>
                            <p className="mt-1 text-xl font-bold tabular-nums">
                                {STUDENT_REPORT_SUMMARY.classSize}
                            </p>
                        </div>
                    </div>
                </DashboardSection>

                <DashboardSection
                    icon={CalendarCheck}
                    title="Exams"
                    description="Schedule & recent results"
                    action={{ label: "All exams", to: ROUTES.EXAMS }}
                >
                    <ul className="divide-border/60 divide-y">
                        {STUDENT_EXAMS.map((exam) => (
                            <li
                                key={exam.id}
                                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {exam.examName} · {exam.subject}
                                    </p>
                                    <p className="text-muted-foreground text-xs">{exam.date}</p>
                                </div>
                                {exam.status === "RESULT" ? (
                                    <span className="bg-success/12 text-success ring-success/25 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ring-1">
                                        {exam.marksObtained}/{exam.totalMarks}
                                    </span>
                                ) : (
                                    <span className="bg-primary/12 text-primary ring-primary/25 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1">
                                        Upcoming
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </DashboardSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardSection
                    icon={NotebookPen}
                    title="Homework"
                    description="What's assigned to you"
                    action={{ label: "View all", to: ROUTES.HOMEWORK }}
                >
                    <ul className="divide-border/60 divide-y">
                        {STUDENT_HOMEWORK.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                            >
                                <div>
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {item.subject} · {item.dueDate}
                                    </p>
                                </div>
                                <span
                                    className={cn(
                                        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
                                        HOMEWORK_STATUS_STYLES[item.status],
                                    )}
                                >
                                    {HOMEWORK_STATUS_LABEL[item.status]}
                                </span>
                            </li>
                        ))}
                    </ul>
                </DashboardSection>

                <DashboardSection
                    icon={Wallet}
                    title="Fees"
                    description="Current payment status"
                    action={{ label: "My fees", to: ROUTES.MY_FEES }}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-muted-foreground text-xs">Outstanding</p>
                                <p className="text-2xl font-bold tabular-nums">
                                    {formatCurrency(feeRemaining)}
                                </p>
                            </div>
                            <span className="bg-warning/12 text-warning ring-warning/25 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1">
                                Partly paid
                            </span>
                        </div>
                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                            <div
                                className="bg-success h-full rounded-full"
                                style={{
                                    width: `${Math.round((fee.amountPaid / fee.totalAmount) * 100)}%`,
                                }}
                            />
                        </div>
                        <div className="text-muted-foreground flex items-center justify-between text-xs">
                            <span>
                                Paid {formatCurrency(fee.amountPaid)} of{" "}
                                {formatCurrency(fee.totalAmount)}
                            </span>
                            <span>Due {fee.dueDate}</span>
                        </div>
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link to={ROUTES.MY_FEES}>
                                <Percent className="size-4" />
                                View fee history
                            </Link>
                        </Button>
                    </div>
                </DashboardSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardSection
                    icon={Megaphone}
                    title="Announcements"
                    description="Latest from school"
                    action={{ label: "View all", to: ROUTES.ANNOUNCEMENTS }}
                >
                    <AnnouncementsPreviewList items={RECENT_ANNOUNCEMENTS} />
                </DashboardSection>

                <HolidaysWidget />
            </div>
        </div>
    );
}
