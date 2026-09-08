import type { JSX } from "react";

import { Link } from "react-router-dom";

import { CalendarDays, ClipboardList, Megaphone, NotebookPen, Plus } from "lucide-react";

import { PERMISSIONS } from "@constants/permissions.constants";
import { attendancePage, ROUTES } from "@constants/routes.constants";

import { hasPermission, useAuthStore } from "@features/auth";
import { HolidaysWidget } from "@features/holidays";


import { Stagger, StaggerItem } from "@components/common/Motion";

import { Button } from "@/components/ui/button";

import {
    RECENT_ANNOUNCEMENTS,
    TEACHER_GRADING_QUEUE,
    TEACHER_SCHEDULE,
    TEACHER_STATS,
} from "../lib/mockStats";

import { AnnouncementsPreviewList } from "./AnnouncementsPreviewList";
import { DashboardSection } from "./DashboardSection";
import { StatCard } from "./StatCard";
import { WelcomeBanner } from "./WelcomeBanner";

export function TeacherDashboard(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const canManageHomework = hasPermission(user?.permissions, PERMISSIONS.HOMEWORK_MANAGE);
    const canManageAnnouncements = hasPermission(
        user?.permissions,
        PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    );

    return (
        <div className="space-y-6">
            <WelcomeBanner subtitle="Here's your teaching day at a glance." />

            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {TEACHER_STATS.map((stat) => (
                    <StaggerItem key={stat.label}>
                        <StatCard stat={stat} />
                    </StaggerItem>
                ))}
            </Stagger>

            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardSection
                    icon={CalendarDays}
                    title="Today's classes"
                    description="Mark attendance for each period"
                    action={{ label: "Attendance", to: ROUTES.ATTENDANCE }}
                >
                    <ul className="divide-border/60 divide-y">
                        {TEACHER_SCHEDULE.map((item) => (
                            <li
                                key={item.sectionId}
                                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="bg-muted text-muted-foreground inline-flex w-14 shrink-0 justify-center rounded-md py-1 text-xs font-semibold tabular-nums">
                                        {item.time}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium">{item.className}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {item.subject} · {item.room}
                                        </p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link to={attendancePage("mark", item.sectionId)}>Mark</Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </DashboardSection>

                <DashboardSection
                    icon={ClipboardList}
                    title="Grade-entry queue"
                    description="Exams awaiting your marks"
                    action={{ label: "All exams", to: ROUTES.EXAMS }}
                >
                    <ul className="divide-border/60 divide-y">
                        {TEACHER_GRADING_QUEUE.map((item) => (
                            <li
                                key={`${item.examId}-${item.className}`}
                                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.examName} · {item.subject}
                                    </p>
                                    <p className="text-muted-foreground text-xs">{item.className}</p>
                                </div>
                                {item.pending > 0 ? (
                                    <span className="bg-warning/12 text-warning ring-warning/25 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1">
                                        {item.pending} pending
                                    </span>
                                ) : (
                                    <span className="bg-success/12 text-success ring-success/25 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1">
                                        Done
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
                    description="Issued to your classes"
                    action={{ label: "Manage", to: ROUTES.HOMEWORK }}
                >
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-muted-foreground text-sm">
                            7 active assignments across 5 classes.
                        </p>
                        {canManageHomework ? (
                            <Button asChild size="sm">
                                <Link to={ROUTES.HOMEWORK}>
                                    <Plus className="size-4" />
                                    New homework
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </DashboardSection>

                <DashboardSection
                    icon={Megaphone}
                    title="Announcements"
                    description="Recent school-wide notices"
                    action={{ label: "View all", to: ROUTES.ANNOUNCEMENTS }}
                >
                    <div className="space-y-4">
                        {canManageAnnouncements ? (
                            <Button asChild size="sm">
                                <Link to={ROUTES.ANNOUNCEMENTS}>
                                    <Plus className="size-4" />
                                    New announcement
                                </Link>
                            </Button>
                        ) : null}
                        <AnnouncementsPreviewList items={RECENT_ANNOUNCEMENTS} />
                    </div>
                </DashboardSection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <HolidaysWidget />
            </div>
        </div>
    );
}
