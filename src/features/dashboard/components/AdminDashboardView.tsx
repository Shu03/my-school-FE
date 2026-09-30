import type { JSX } from "react";

import { Link } from "react-router-dom";

import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    CalendarCheck,
    ChevronRight,
    GraduationCap,
    KeyRound,
    Landmark,
    ReceiptIndianRupee,
    Sun,
    Users,
    Wallet,
} from "lucide-react";

import { DASHBOARD_FEE_STATUS_LABELS } from "@constants/dashboard.constants";
import { FEE_STATUS_LIST } from "@constants/fees.constants";
import { attendancePage, ROUTES } from "@constants/routes.constants";

import { Stagger, StaggerItem } from "@components/common/Motion";

import { cn } from "@/lib/utils";

import { formatMoney, percentOf, pluralize } from "../lib/format";
import { FEE_STATUS_TONE, TONE_FILL } from "../lib/tone";
import type { AdminDashboard } from "../types/dashboard.types";

import { AnnouncementList } from "./AnnouncementList";
import { HolidayList } from "./HolidayList";
import { PercentRing, ProgressBar } from "./Meters";
import { EmptyState, SectionCard } from "./SectionCard";
import { StatCard } from "./StatCard";
import { StatusChip } from "./StatusChip";
import { UpcomingExamsCard } from "./UpcomingExamsCard";

function AttendanceTodayCard({ data }: { data: AdminDashboard["attendanceToday"] }): JSX.Element {
    return (
        <SectionCard
            icon={CalendarCheck}
            title="Today's attendance"
            description="Across all sections"
            action={{ label: "Open attendance", to: attendancePage("overview") }}
        >
            {!data.isSchoolDay ? (
                <EmptyState
                    icon={Sun}
                    message="No school today"
                    hint="It's a holiday or weekly off, so attendance isn't taken."
                />
            ) : (
                <AttendanceTodayBody {...data} />
            )}
        </SectionCard>
    );
}

function AttendanceTodayBody({
    sectionsMarked,
    sectionsPending,
    absentees,
    presentPercentage,
}: Extract<AdminDashboard["attendanceToday"], { isSchoolDay: true }>): JSX.Element {
    const totalSections = sectionsMarked + sectionsPending;
    const notTaken = sectionsMarked === 0;

    return (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center gap-1.5">
                <PercentRing
                    value={notTaken ? null : presentPercentage}
                    label="Present today in marked sections"
                    caption="Present"
                />
                {notTaken ? (
                    <p className="text-muted-foreground text-xs">Attendance not taken yet</p>
                ) : (
                    <p className="text-muted-foreground text-xs">Of marked sections</p>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">Sections marked</span>
                        <span className="font-semibold tabular-nums">
                            {sectionsMarked} / {totalSections}
                        </span>
                    </div>
                    <ProgressBar
                        value={percentOf(sectionsMarked, totalSections)}
                        label="Sections that have marked attendance"
                        tone={sectionsPending > 0 ? "warning" : "success"}
                    />
                </div>

                {sectionsPending > 0 ? (
                    <p className="bg-warning/10 text-warning ring-warning/20 flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium ring-1">
                        <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                        {pluralize(sectionsPending, "section")}{" "}
                        {sectionsPending === 1 ? "hasn't" : "haven't"} marked attendance yet
                    </p>
                ) : null}

                <div className="border-border/60 bg-muted/30 flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <span className="text-muted-foreground text-sm">Absent today</span>
                    <span className="text-lg font-bold tabular-nums">{absentees}</span>
                </div>
            </div>
        </div>
    );
}

function FeesCard({
    fees,
    yearName,
}: {
    fees: AdminDashboard["fees"];
    yearName: string;
}): JSX.Element {
    const collectedPercent = percentOf(fees.collected, fees.expected);
    const totalRecords = FEE_STATUS_LIST.reduce((sum, status) => sum + fees.byStatus[status], 0);

    const figures = [
        { label: "Expected", value: fees.expected, className: "" },
        { label: "Collected", value: fees.collected, className: "text-success" },
        { label: "Outstanding", value: fees.outstanding, className: "text-warning" },
    ];

    return (
        <SectionCard
            icon={ReceiptIndianRupee}
            title="Fees"
            description={`Academic year ${yearName}`}
            action={{ label: "View fee records", to: ROUTES.FEES }}
        >
            <div className="flex flex-col gap-5">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {figures.map((figure) => (
                        <div
                            key={figure.label}
                            className="border-border/60 bg-muted/25 rounded-lg border px-3 py-2.5"
                        >
                            <dt className="text-muted-foreground text-xs">{figure.label}</dt>
                            <dd
                                className={cn(
                                    "mt-0.5 truncate text-base font-bold tabular-nums",
                                    figure.className,
                                )}
                            >
                                {formatMoney(figure.value)}
                            </dd>
                        </div>
                    ))}
                </dl>

                <div>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                        <span className="text-muted-foreground">Collection progress</span>
                        <span className="font-semibold tabular-nums">
                            {collectedPercent}% collected
                        </span>
                    </div>
                    <ProgressBar
                        value={collectedPercent}
                        label="Fees collected of expected"
                        tone="success"
                    />
                </div>

                <div>
                    <h3 className="text-muted-foreground mb-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Records by status
                    </h3>
                    {totalRecords > 0 ? (
                        <div
                            className="bg-muted mb-3 flex h-2 overflow-hidden rounded-full"
                            aria-hidden="true"
                        >
                            {FEE_STATUS_LIST.map((status) => (
                                <div
                                    key={status}
                                    className={TONE_FILL[FEE_STATUS_TONE[status]]}
                                    style={{
                                        width: `${percentOf(fees.byStatus[status], totalRecords)}%`,
                                    }}
                                />
                            ))}
                        </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                        {FEE_STATUS_LIST.map((status) => (
                            <StatusChip key={status} tone={FEE_STATUS_TONE[status]} dot>
                                {DASHBOARD_FEE_STATUS_LABELS[status]}
                                <span className="tabular-nums">{fees.byStatus[status]}</span>
                            </StatusChip>
                        ))}
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

function AccountsCard({ accounts }: { accounts: AdminDashboard["accounts"] }): JSX.Element {
    const flow = [
        { label: "Total deposited", value: accounts.totalDeposited },
        { label: "Total withdrawn", value: accounts.totalWithdrawn },
        { label: "Total spent (bills)", value: accounts.totalSpent },
    ];

    return (
        <SectionCard
            icon={Landmark}
            title="Accounts"
            description="All-time, not tied to the academic year"
            action={{ label: "Open accounts", to: ROUTES.ACCOUNTS }}
        >
            <div className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="from-primary/12 ring-primary/20 texture-sheen rounded-xl bg-linear-to-br to-transparent p-4 ring-1">
                        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                            <Landmark className="size-3.5" aria-hidden="true" />
                            Balance in account
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
                            {formatMoney(accounts.totalBalance)}
                        </p>
                    </div>
                    <div className="from-success/12 ring-success/20 texture-sheen rounded-xl bg-linear-to-br to-transparent p-4 ring-1">
                        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                            <Wallet className="size-3.5" aria-hidden="true" />
                            Cash in hand
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
                            {formatMoney(accounts.withdrawnBalance)}
                        </p>
                    </div>
                </div>

                <dl className="border-border/60 flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
                    {flow.map((step, index) => (
                        <div key={step.label} className="flex flex-1 items-center gap-2">
                            {index > 0 ? (
                                <ChevronRight
                                    className="text-muted-foreground/60 hidden size-4 shrink-0 sm:block"
                                    aria-hidden="true"
                                />
                            ) : null}
                            <div className="min-w-0">
                                <dt className="text-muted-foreground text-xs">{step.label}</dt>
                                <dd className="truncate text-sm font-semibold tabular-nums">
                                    {formatMoney(step.value)}
                                </dd>
                            </div>
                        </div>
                    ))}
                </dl>
            </div>
        </SectionCard>
    );
}

function EnrollmentCard({ rows }: { rows: AdminDashboard["enrollmentByClassLevel"] }): JSX.Element {
    const max = Math.max(0, ...rows.map((row) => row.students));

    return (
        <SectionCard
            icon={GraduationCap}
            title="Students per class"
            description="Current enrolments"
        >
            {rows.length === 0 ? (
                <EmptyState icon={GraduationCap} message="No classes set up for this year" />
            ) : (
                <ul className="flex flex-col gap-2.5">
                    {rows.map((row) => (
                        <li
                            key={row.classLevel}
                            className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-3 text-sm"
                        >
                            <span className="text-muted-foreground font-medium">
                                Class {row.classLevel}
                            </span>
                            <div
                                className="bg-muted h-2.5 overflow-hidden rounded-full"
                                role="img"
                                aria-label={`Class ${row.classLevel}: ${pluralize(row.students, "student")}`}
                            >
                                <div
                                    className="from-chart-2 to-chart-4 h-full rounded-full bg-linear-to-r transition-[width] duration-700 ease-out motion-reduce:transition-none"
                                    style={{ width: `${percentOf(row.students, max)}%` }}
                                />
                            </div>
                            <span className="text-right font-semibold tabular-nums">
                                {row.students}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}

export function AdminDashboardView({ data }: { data: AdminDashboard }): JSX.Element {
    const pending = data.pendingAccessRequests;

    return (
        <div className="flex flex-col gap-6">
            <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StaggerItem>
                    <StatCard
                        label="Students"
                        value={data.counts.students}
                        icon={GraduationCap}
                        hint={`Enrolled in ${data.academicYear.name}`}
                        to={ROUTES.STUDENTS}
                    />
                </StaggerItem>
                <StaggerItem>
                    <StatCard
                        label="Teachers"
                        value={data.counts.teachers}
                        icon={Users}
                        hint="Active teacher accounts"
                        to={ROUTES.TEACHERS}
                    />
                </StaggerItem>
                <StaggerItem>
                    <StatCard
                        label="Classes / Sections"
                        value={data.counts.sections}
                        icon={BookOpen}
                        hint={`Sections in ${data.academicYear.name}`}
                        to={ROUTES.CLASSES}
                    />
                </StaggerItem>
                <StaggerItem>
                    <StatCard
                        label="Pending access requests"
                        value={pending}
                        icon={KeyRound}
                        tone={pending > 0 ? "warning" : "primary"}
                        hint={pending > 0 ? "Awaiting your review" : "Nothing to review"}
                        to={ROUTES.REQUEST_ACCESS}
                    />
                </StaggerItem>
            </Stagger>

            <div className="grid gap-6 lg:grid-cols-2">
                <AttendanceTodayCard data={data.attendanceToday} />
                <FeesCard fees={data.fees} yearName={data.academicYear.name} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <AccountsCard accounts={data.accounts} />
                <EnrollmentCard rows={data.enrollmentByClassLevel} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <UpcomingExamsCard
                    items={data.exams.upcoming}
                    today={data.today}
                    linkable
                    className="lg:col-span-2 xl:col-span-1"
                    headerExtra={
                        data.exams.notFinalizedCount > 0 ? (
                            <Link
                                to={ROUTES.EXAMS}
                                className="focus-visible:ring-ring/50 rounded-md outline-none focus-visible:ring-2"
                            >
                                <StatusChip tone="warning" dot>
                                    {pluralize(data.exams.notFinalizedCount, "exam")} not finalized
                                    <ArrowRight className="size-3" aria-hidden="true" />
                                </StatusChip>
                            </Link>
                        ) : null
                    }
                />
                <AnnouncementList items={data.announcements} />
                <HolidayList items={data.upcomingHolidays} today={data.today} />
            </div>
        </div>
    );
}
