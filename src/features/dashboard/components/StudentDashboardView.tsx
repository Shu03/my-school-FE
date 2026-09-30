import { useId } from "react";
import type { JSX } from "react";

import { Link } from "react-router-dom";

import {
    Award,
    CalendarCheck,
    CalendarDays,
    CheckCircle2,
    Info,
    NotebookPen,
    ReceiptIndianRupee,
    UserRound,
} from "lucide-react";

import { DASHBOARD_CONFIG, DASHBOARD_FEE_STATUS_LABELS } from "@constants/dashboard.constants";
import { ROUTES } from "@constants/routes.constants";

import { formatSectionLabel } from "@lib/section";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    formatDateOnly,
    formatMoney,
    percentOf,
    percentTone,
    pluralize,
    toDateKey,
} from "../lib/format";
import { FEE_STATUS_TONE } from "../lib/tone";
import type {
    AttendanceCounts,
    ExamResultItem,
    HomeworkDueItem,
    StudentDashboard,
    StudentEnrollment,
    StudentFees,
} from "../types/dashboard.types";

import { AnnouncementList } from "./AnnouncementList";
import { DateLeaf } from "./DateLeaf";
import { HolidayList } from "./HolidayList";
import { PercentRing, ProgressBar } from "./Meters";
import { EmptyState, SectionCard } from "./SectionCard";
import { ExamTypeChip, RelativeDayBadge, StatusChip } from "./StatusChip";
import { UpcomingExamsCard } from "./UpcomingExamsCard";

const RESULT_RING_SIZE = 56;
const RESULT_RING_STROKE = 6;

function MyClassHeader({ enrollment }: { enrollment: StudentEnrollment | null }): JSX.Element {
    const headingId = useId();

    if (!enrollment) {
        return (
            <div
                role="status"
                className="bg-info/8 text-info ring-info/25 flex items-start gap-3 rounded-xl px-5 py-4 ring-1"
            >
                <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <p className="text-sm font-medium">
                    You are not enrolled in a class for the current academic year. Please contact
                    the school office.
                </p>
            </div>
        );
    }

    const teacher = enrollment.classTeacher;

    return (
        <section
            aria-labelledby={headingId}
            className="bg-card ring-foreground/10 texture-grain relative overflow-hidden rounded-xl shadow-sm ring-1"
        >
            <div className="from-primary/14 via-primary/5 flex flex-wrap items-center gap-4 bg-linear-to-r to-transparent px-5 py-4">
                <span
                    className="bg-primary text-primary-foreground texture-sheen flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl shadow-sm"
                    aria-hidden="true"
                >
                    <span className="text-xl leading-none font-bold tabular-nums">
                        {enrollment.classLevel}
                    </span>
                    <span className="mt-0.5 max-w-12 truncate text-[0.65rem] font-semibold">
                        {enrollment.sectionName}
                    </span>
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        My class
                    </p>
                    <h2 id={headingId} className="text-xl font-bold tracking-tight">
                        {formatSectionLabel(enrollment.classLevel, enrollment.sectionName)}
                    </h2>
                </div>
                <dl className="flex flex-wrap gap-2 text-sm">
                    <div className="border-border/60 bg-card/70 rounded-lg border px-3 py-1.5">
                        <dt className="text-muted-foreground text-[0.7rem]">Roll No.</dt>
                        <dd className="font-semibold tabular-nums">{enrollment.rollNumber}</dd>
                    </div>
                    <div className="border-border/60 bg-card/70 flex items-center gap-2 rounded-lg border px-3 py-1.5">
                        <UserRound className="text-muted-foreground size-4" aria-hidden="true" />
                        <div>
                            <dt className="text-muted-foreground text-[0.7rem]">Class teacher</dt>
                            <dd className="font-semibold">
                                {teacher
                                    ? `${teacher.firstName} ${teacher.lastName}`
                                    : "Not assigned"}
                            </dd>
                        </div>
                    </div>
                </dl>
            </div>
        </section>
    );
}

function AttendancePanel({
    counts,
    period,
}: {
    counts: AttendanceCounts;
    period: string;
}): JSX.Element {
    const empty = counts.totalDays === 0;
    return (
        <div className="flex flex-col items-center gap-5 pt-3 sm:flex-row">
            <PercentRing
                value={empty ? null : counts.percentage}
                label={`Attendance ${period}`}
                caption="Present"
            />
            {empty ? (
                <p className="text-muted-foreground text-sm">No attendance recorded yet</p>
            ) : (
                <dl className="grid w-full flex-1 grid-cols-2 gap-3">
                    <div className="border-border/60 bg-success/6 rounded-lg border px-3 py-2.5">
                        <dt className="text-muted-foreground text-xs">Present</dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                            {counts.present} / {pluralize(counts.totalDays, "day")}
                        </dd>
                    </div>
                    <div className="border-border/60 bg-destructive/5 rounded-lg border px-3 py-2.5">
                        <dt className="text-muted-foreground text-xs">Absent</dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                            {pluralize(counts.absent, "day")}
                        </dd>
                    </div>
                </dl>
            )}
        </div>
    );
}

function AttendanceCard({
    attendance,
}: {
    attendance: NonNullable<StudentDashboard["attendance"]>;
}): JSX.Element {
    return (
        <SectionCard
            icon={CalendarCheck}
            title="Attendance"
            description="Your presence record"
            action={{ label: "View attendance", to: ROUTES.ATTENDANCE }}
        >
            <Tabs defaultValue="month">
                <TabsList className="h-10 w-full">
                    <TabsTrigger value="month">
                        <CalendarDays />
                        This month
                    </TabsTrigger>
                    <TabsTrigger value="year">
                        <CalendarCheck />
                        This year
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="month">
                    <AttendancePanel counts={attendance.month} period="this month" />
                </TabsContent>
                <TabsContent value="year">
                    <AttendancePanel counts={attendance.year} period="this year" />
                </TabsContent>
            </Tabs>
        </SectionCard>
    );
}

function FeesCard({ fees, today }: { fees: StudentFees | null; today: string }): JSX.Element {
    return (
        <SectionCard
            icon={ReceiptIndianRupee}
            title="Fees"
            description="Current academic year"
            action={{ label: "My fees", to: ROUTES.MY_FEES }}
        >
            {fees ? (
                <FeesBody fees={fees} today={today} />
            ) : (
                <EmptyState icon={ReceiptIndianRupee} message="No fee record for this year" />
            )}
        </SectionCard>
    );
}

function FeesBody({ fees, today }: { fees: StudentFees; today: string }): JSX.Element {
    const isPaid = fees.status === "PAID";
    const isOverdue = fees.due > 0 && today > toDateKey(fees.dueDate);
    const paidPercent = percentOf(fees.paid, fees.total);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                {isPaid ? (
                    <div className="flex items-center gap-3">
                        <span className="bg-success/12 text-success ring-success/25 flex size-11 items-center justify-center rounded-full ring-1">
                            <CheckCircle2 className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-lg font-bold">All fees paid</p>
                            <p className="text-muted-foreground text-xs">
                                Thank you — nothing is due.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-muted-foreground text-xs">Due</p>
                        <p className="text-3xl font-bold tracking-tight tabular-nums">
                            {formatMoney(fees.due)}
                        </p>
                    </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                    <StatusChip tone={FEE_STATUS_TONE[fees.status]} dot>
                        {DASHBOARD_FEE_STATUS_LABELS[fees.status]}
                    </StatusChip>
                    {isOverdue ? (
                        <StatusChip tone="destructive" dot>
                            Overdue
                        </StatusChip>
                    ) : null}
                </div>
            </div>

            <ProgressBar value={paidPercent} label="Fees paid of total" tone="success" />

            <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <dt className="text-muted-foreground text-xs">Total</dt>
                    <dd className="font-semibold tabular-nums">{formatMoney(fees.total)}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground text-xs">Paid</dt>
                    <dd className="text-success font-semibold tabular-nums">
                        {formatMoney(fees.paid)}
                    </dd>
                </div>
            </dl>

            {isPaid ? null : (
                <p
                    className={
                        isOverdue
                            ? "text-destructive text-xs font-medium"
                            : "text-muted-foreground text-xs"
                    }
                >
                    Due by {formatDateOnly(fees.dueDate)}
                </p>
            )}
        </div>
    );
}

function HomeworkCard({ items, today }: { items: HomeworkDueItem[]; today: string }): JSX.Element {
    return (
        <SectionCard
            icon={NotebookPen}
            title="Homework due soon"
            description={`Next ${DASHBOARD_CONFIG.UPCOMING_WINDOW_DAYS} days`}
            action={{ label: "View all", to: ROUTES.HOMEWORK }}
        >
            {items.length === 0 ? (
                <EmptyState
                    icon={NotebookPen}
                    message={`No homework due in the next ${DASHBOARD_CONFIG.UPCOMING_WINDOW_DAYS} days`}
                />
            ) : (
                <ul className="flex flex-col gap-1">
                    {items.map((item) => (
                        <li key={item.id}>
                            <Link
                                to={ROUTES.HOMEWORK}
                                className="hover:bg-muted/50 focus-visible:ring-ring/50 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors outline-none focus-visible:ring-2"
                            >
                                <DateLeaf iso={item.dueDate} today={today} />
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold">{item.title}</h3>
                                    <p className="text-muted-foreground text-xs">
                                        {item.subjectName}
                                        <span aria-hidden="true"> · </span>
                                        Due {formatDateOnly(item.dueDate)}
                                    </p>
                                </div>
                                <RelativeDayBadge iso={item.dueDate} today={today} prefix="Due" />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}

function ResultsCard({ items }: { items: ExamResultItem[] }): JSX.Element {
    return (
        <SectionCard
            icon={Award}
            title="Recent results"
            description="Finalized exams"
            action={{ label: "Report card", to: ROUTES.MY_REPORT_CARD }}
        >
            {items.length === 0 ? (
                <EmptyState icon={Award} message="No results published yet." />
            ) : (
                <div className="@container">
                    <ul className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-5">
                        {items.map((item) => (
                            <li key={item.examId}>
                                <Link
                                    to={ROUTES.MY_REPORT_CARD}
                                    className="group border-border/70 hover:border-primary/40 focus-visible:ring-ring/50 flex h-full items-center gap-3 rounded-xl border p-3 transition-colors outline-none focus-visible:ring-2"
                                >
                                    <PercentRing
                                        value={item.percentage}
                                        tone={percentTone(item.percentage)}
                                        label={`${item.examName} score`}
                                        size={RESULT_RING_SIZE}
                                        strokeWidth={RESULT_RING_STROKE}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="group-hover:text-primary truncate text-sm font-semibold transition-colors">
                                            {item.examName}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <ExamTypeChip type={item.examType} />
                                            <span className="text-muted-foreground text-xs tabular-nums">
                                                {item.marksObtained} / {item.totalMarks}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </SectionCard>
    );
}

export function StudentDashboardView({ data }: { data: StudentDashboard }): JSX.Element {
    const enrolled = data.enrollment !== null;
    const showFees = enrolled || data.fees !== null;

    return (
        <div className="flex flex-col gap-6">
            <MyClassHeader enrollment={data.enrollment} />

            {data.attendance || showFees ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    {data.attendance ? <AttendanceCard attendance={data.attendance} /> : null}
                    {showFees ? <FeesCard fees={data.fees} today={data.today} /> : null}
                </div>
            ) : null}

            {data.homeworkDueSoon || data.exams ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    {data.homeworkDueSoon ? (
                        <HomeworkCard items={data.homeworkDueSoon} today={data.today} />
                    ) : null}
                    {data.exams ? (
                        <UpcomingExamsCard
                            items={data.exams.upcoming}
                            today={data.today}
                            linkable={false}
                            showSection={false}
                        />
                    ) : null}
                </div>
            ) : null}

            {data.exams ? <ResultsCard items={data.exams.recentResults} /> : null}

            <div className="grid gap-6 lg:grid-cols-2">
                <AnnouncementList items={data.announcements} />
                <HolidayList items={data.upcomingHolidays} today={data.today} />
            </div>
        </div>
    );
}
