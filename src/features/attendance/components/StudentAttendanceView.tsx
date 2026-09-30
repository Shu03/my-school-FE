import { useState } from "react";
import type { ComponentType, JSX } from "react";

import {
    AlertCircle,
    CalendarCheck2,
    CalendarX2,
    ChevronLeft,
    ChevronRight,
    Flame,
    PartyPopper,
} from "lucide-react";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";
import { useHolidaysList } from "@features/holidays";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useStudentAttendance } from "../hooks/useAttendance";
import { schoolToday } from "../lib/format";
import type { AttendanceDayStatus } from "../types/attendance.types";

type DayKind = "present" | "absent" | "holiday" | "unmarked" | "upcoming";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MIN_REQUIRED_PERCENTAGE = 75;
const DAY_MS = 86_400_000;

const DAY_STYLES: Record<DayKind, string> = {
    present: "bg-success text-success-foreground shadow-sm shadow-success/25",
    absent: "bg-destructive text-white shadow-sm shadow-destructive/25",
    holiday: "bg-warning/15 text-warning ring-1 ring-inset ring-warning/40",
    unmarked: "bg-muted/70 text-muted-foreground",
    upcoming: "border border-dashed border-border text-muted-foreground/60",
};

const DAY_LABELS: Record<DayKind, string> = {
    present: "Present",
    absent: "Absent",
    holiday: "Holiday",
    unmarked: "Attendance not taken",
    upcoming: "Upcoming",
};

const LEGEND: { kind: DayKind; label: string }[] = [
    { kind: "present", label: "Present" },
    { kind: "absent", label: "Absent" },
    { kind: "holiday", label: "Holiday" },
    { kind: "unmarked", label: "Not taken" },
    { kind: "upcoming", label: "Upcoming" },
];

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});
const longDateFormatter = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" });
const monthShortFormatter = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" });

function toUtcDate(isoDate: string): Date {
    const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function shiftMonth(month: string, delta: number): string {
    const [year, monthNumber] = month.split("-").map(Number);
    return toIsoDate(new Date(Date.UTC(year, monthNumber - 1 + delta, 1))).slice(0, 7);
}

function clampMonth(month: string, min: string, max: string): string {
    if (month < min) return min;
    if (month > max) return max;
    return month;
}

function daysAgo(isoDate: string, today: string): string {
    const days = Math.round((toUtcDate(today).getTime() - toUtcDate(isoDate).getTime()) / DAY_MS);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

/** Monday-first grid cells for a month; `null` pads the first week. */
function buildMonthGrid(month: string): (string | null)[] {
    const first = toUtcDate(`${month}-01`);
    const leadingBlanks = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(
        Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
    ).getUTCDate();

    const cells: (string | null)[] = Array.from({ length: leadingBlanks }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(`${month}-${String(day).padStart(2, "0")}`);
    }
    return cells;
}

function toPercentage(part: number, total: number): number | null {
    return total > 0 ? Math.round((part / total) * 100) : null;
}

interface YearSummary {
    total: number;
    present: number;
    absent: number;
    absences: string[];
    streak: number;
    percentage: number | null;
}

interface MonthSummary {
    present: number;
    absent: number;
    total: number;
}

function summarizeYear(statusByDate: Map<string, AttendanceDayStatus>): YearSummary {
    const newestFirst = [...statusByDate.entries()].sort(([a], [b]) => b.localeCompare(a));
    const present = newestFirst.filter(([, status]) => status === "PRESENT").length;
    const absences = newestFirst.filter(([, status]) => status === "ABSENT").map(([date]) => date);

    let streak = 0;
    for (const [, status] of newestFirst) {
        if (status !== "PRESENT") break;
        streak++;
    }

    return {
        total: newestFirst.length,
        present,
        absent: absences.length,
        absences,
        streak,
        percentage: toPercentage(present, newestFirst.length),
    };
}

function summarizeMonth(
    statusByDate: Map<string, AttendanceDayStatus>,
    month: string,
): MonthSummary {
    let present = 0;
    let absent = 0;
    for (const [date, status] of statusByDate) {
        if (!date.startsWith(month)) continue;
        if (status === "PRESENT") present++;
        else absent++;
    }
    return { present, absent, total: present + absent };
}

function getVerdict(percentage: number | null): { title: string; tone: string } {
    if (percentage === null) return { title: "No attendance yet", tone: "text-muted-foreground" };
    if (percentage >= 90) return { title: "Excellent attendance", tone: "text-success" };
    if (percentage >= MIN_REQUIRED_PERCENTAGE)
        return { title: "Good — keep it up", tone: "text-warning" };
    return { title: "Needs attention", tone: "text-destructive" };
}

export function StudentAttendanceView(): JSX.Element {
    const studentId = useAuthStore((s) => s.user?.studentProfileId ?? null);
    const today = schoolToday();
    const todayMonth = today.slice(0, 7);

    const { data: currentYear, isLoading: yearLoading } = useCurrentAcademicYear();
    const academicYearId = currentYear?.id;
    const {
        data: records,
        isLoading: recordsLoading,
        isError,
    } = useStudentAttendance(studentId, { academicYearId }, Boolean(academicYearId));
    const { data: holidays } = useHolidaysList({ academicYearId }, Boolean(academicYearId));

    const [viewedMonth, setViewedMonth] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const firstMonth = currentYear?.startDate.slice(0, 7) ?? todayMonth;
    const lastMonth = currentYear?.endDate.slice(0, 7) ?? todayMonth;
    const month = viewedMonth ?? clampMonth(todayMonth, firstMonth, lastMonth);

    const statusByDate = new Map<string, AttendanceDayStatus>(
        (records ?? []).map((record) => [record.date.slice(0, 10), record.status]),
    );
    const holidayByDate = new Map<string, string>(
        (holidays ?? []).map((holiday) => [holiday.date.slice(0, 10), holiday.name]),
    );
    const year = summarizeYear(statusByDate);
    const monthStats = summarizeMonth(statusByDate, month);
    const grid = buildMonthGrid(month);

    function getDayKind(date: string): DayKind {
        const status = statusByDate.get(date);
        if (status) return status === "PRESENT" ? "present" : "absent";
        if (holidayByDate.has(date)) return "holiday";
        if (date > today) return "upcoming";
        return "unmarked";
    }

    function describeDay(date: string): string {
        const kind = getDayKind(date);
        const holiday = holidayByDate.get(date);
        return kind === "holiday" && holiday ? `Holiday · ${holiday}` : DAY_LABELS[kind];
    }

    function goToMonth(next: string): void {
        setViewedMonth(clampMonth(next, firstMonth, lastMonth));
        setSelectedDate(null);
    }

    function focusDate(date: string): void {
        setViewedMonth(date.slice(0, 7));
        setSelectedDate(date);
    }

    if (!studentId) {
        return (
            <Alert>
                <AlertCircle />
                <AlertDescription>No student profile is linked to your account.</AlertDescription>
            </Alert>
        );
    }

    if (yearLoading || recordsLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading your attendance…</span>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>
                    Your attendance could not be loaded right now. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    const verdict = getVerdict(year.percentage);
    const monthPercentage = toPercentage(monthStats.present, monthStats.total);
    const lastAbsence = year.absences[0];

    return (
        <div className="flex flex-col gap-6">
            <AttendanceHero
                yearName={currentYear?.name}
                percentage={year.percentage}
                verdict={verdict}
                present={year.present}
                absent={year.absent}
                total={year.total}
                streak={year.streak}
                lastAbsence={lastAbsence ? daysAgo(lastAbsence, today) : null}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <section
                    aria-label="Monthly attendance calendar"
                    className="bg-card ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1"
                >
                    <header className="border-border/60 flex items-center justify-between gap-3 border-b px-5 py-4">
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold">
                                {monthFormatter.format(toUtcDate(`${month}-01`))}
                            </h2>
                            <p className="text-muted-foreground text-xs tabular-nums">
                                {monthStats.total > 0
                                    ? `${monthStats.present} present · ${monthStats.absent} absent · ${monthPercentage}%`
                                    : "No attendance taken this month"}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label="Previous month"
                                disabled={month <= firstMonth}
                                onClick={() => goToMonth(shiftMonth(month, -1))}
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={month === clampMonth(todayMonth, firstMonth, lastMonth)}
                                onClick={() => {
                                    goToMonth(todayMonth);
                                    setSelectedDate(today);
                                }}
                            >
                                Today
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                aria-label="Next month"
                                disabled={month >= lastMonth}
                                onClick={() => goToMonth(shiftMonth(month, 1))}
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                    </header>

                    <div className="flex flex-col gap-5 px-5 py-5">
                        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                            {WEEKDAYS.map((weekday) => (
                                <span
                                    key={weekday}
                                    className="text-muted-foreground pb-1 text-center text-[0.7rem] font-semibold tracking-wider uppercase"
                                >
                                    {weekday}
                                </span>
                            ))}
                            {grid.map((date, index) => {
                                if (!date) return <span key={`blank-${index}`} aria-hidden />;

                                const kind = getDayKind(date);
                                const isToday = date === today;
                                const isSelected = date === selectedDate;

                                return (
                                    <button
                                        key={date}
                                        type="button"
                                        title={describeDay(date)}
                                        aria-label={`${longDateFormatter.format(toUtcDate(date))}: ${describeDay(date)}`}
                                        aria-pressed={isSelected}
                                        onClick={() => setSelectedDate(isSelected ? null : date)}
                                        className={cn(
                                            "focus-visible:ring-ring/50 relative flex aspect-square items-center justify-center rounded-lg text-sm font-semibold tabular-nums transition-all duration-200 outline-none hover:scale-105 focus-visible:ring-3 motion-reduce:hover:scale-100",
                                            DAY_STYLES[kind],
                                            isSelected &&
                                                "ring-foreground ring-offset-card scale-105 ring-2 ring-offset-2",
                                            isToday &&
                                                "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current",
                                        )}
                                    >
                                        {Number(date.slice(8))}
                                    </button>
                                );
                            })}
                        </div>

                        <p
                            aria-live="polite"
                            className="border-border/60 bg-muted/30 flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                        >
                            {selectedDate ? (
                                <>
                                    <span
                                        className={cn(
                                            "size-3 shrink-0 rounded-sm",
                                            DAY_STYLES[getDayKind(selectedDate)],
                                        )}
                                        aria-hidden
                                    />
                                    <span className="font-medium">
                                        {longDateFormatter.format(toUtcDate(selectedDate))}
                                    </span>
                                    <span className="text-muted-foreground">
                                        — {describeDay(selectedDate)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">
                                    Tap any day to see what happened.
                                </span>
                            )}
                        </p>

                        {monthStats.total > 0 && (
                            <div
                                className="bg-muted flex h-2.5 overflow-hidden rounded-full"
                                role="img"
                                aria-label={`${monthStats.present} days present and ${monthStats.absent} days absent this month`}
                            >
                                <div
                                    className="bg-success transition-[width] duration-500 motion-reduce:transition-none"
                                    style={{ width: `${monthPercentage}%` }}
                                />
                                <div
                                    className="bg-destructive transition-[width] duration-500 motion-reduce:transition-none"
                                    style={{ width: `${100 - (monthPercentage ?? 0)}%` }}
                                />
                            </div>
                        )}

                        <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-xs">
                            {LEGEND.map((item) => (
                                <li key={item.kind} className="inline-flex items-center gap-1.5">
                                    <span
                                        className={cn("size-3 rounded-sm", DAY_STYLES[item.kind])}
                                        aria-hidden
                                    />
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <AbsencesList
                    absences={year.absences}
                    today={today}
                    selectedDate={selectedDate}
                    onSelect={focusDate}
                />
            </div>
        </div>
    );
}

interface AttendanceHeroProps {
    yearName: string | undefined;
    percentage: number | null;
    verdict: { title: string; tone: string };
    present: number;
    absent: number;
    total: number;
    streak: number;
    lastAbsence: string | null;
}

function AttendanceHero({
    yearName,
    percentage,
    verdict,
    present,
    absent,
    total,
    streak,
    lastAbsence,
}: AttendanceHeroProps): JSX.Element {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const isBelowMinimum = percentage !== null && percentage < MIN_REQUIRED_PERCENTAGE;

    return (
        <section className="bg-card ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
            <div className="border-border/60 from-primary/12 via-primary/5 flex flex-col gap-6 border-b bg-linear-to-br to-transparent px-6 py-6 md:flex-row md:items-center">
                <div className="flex items-center gap-5">
                    <div className="relative size-28 shrink-0">
                        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                strokeWidth="9"
                                className="stroke-muted"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                strokeWidth="9"
                                strokeLinecap="round"
                                stroke="currentColor"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * (1 - (percentage ?? 0) / 100)}
                                className={cn(
                                    verdict.tone,
                                    "transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none",
                                )}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold tabular-nums">
                                {percentage === null ? "–" : `${percentage}%`}
                            </span>
                            <span className="text-muted-foreground text-[0.6rem] font-semibold tracking-wider uppercase">
                                This year
                            </span>
                        </div>
                    </div>

                    <div className="min-w-0">
                        <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                            {yearName ?? "Current academic year"}
                        </p>
                        <h2 className={cn("mt-1 text-xl font-bold tracking-tight", verdict.tone)}>
                            {verdict.title}
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {total > 0 ? (
                                <>
                                    Present on{" "}
                                    <span className="text-foreground font-semibold tabular-nums">
                                        {present}
                                    </span>{" "}
                                    of <span className="tabular-nums">{total}</span> school days
                                </>
                            ) : (
                                "Your attendance will appear once your teacher marks it."
                            )}
                        </p>
                        {isBelowMinimum && (
                            <p className="text-destructive mt-1 text-xs font-medium">
                                Below the {MIN_REQUIRED_PERCENTAGE}% minimum — talk to your class
                                teacher.
                            </p>
                        )}
                    </div>
                </div>

                <dl className="grid flex-1 grid-cols-3 gap-3 md:ml-auto md:max-w-md">
                    <StatTile
                        icon={CalendarCheck2}
                        label="Present"
                        value={present}
                        tone="text-success bg-success/12 ring-success/25"
                    />
                    <StatTile
                        icon={CalendarX2}
                        label="Absent"
                        value={absent}
                        hint={lastAbsence ? `Last: ${lastAbsence}` : undefined}
                        tone="text-destructive bg-destructive/10 ring-destructive/25"
                    />
                    <StatTile
                        icon={Flame}
                        label="Streak"
                        value={streak}
                        hint={streak === 1 ? "day in a row" : "days in a row"}
                        tone="text-primary bg-primary/12 ring-primary/25"
                    />
                </dl>
            </div>
        </section>
    );
}

interface StatTileProps {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
    hint?: string;
    tone: string;
}

function StatTile({ icon: Icon, label, value, hint, tone }: StatTileProps): JSX.Element {
    return (
        <div className="bg-background/70 border-border/60 rounded-xl border px-3 py-3">
            <dt className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <span
                    className={cn(
                        "texture-sheen flex size-6 items-center justify-center rounded-md ring-1",
                        tone,
                    )}
                >
                    <Icon className="size-3.5" />
                </span>
                {label}
            </dt>
            <dd className="mt-2 text-2xl leading-none font-bold tabular-nums">{value}</dd>
            {hint && <p className="text-muted-foreground mt-1 truncate text-[0.7rem]">{hint}</p>}
        </div>
    );
}

interface AbsencesListProps {
    absences: string[];
    today: string;
    selectedDate: string | null;
    onSelect: (date: string) => void;
}

function AbsencesList({ absences, today, selectedDate, onSelect }: AbsencesListProps): JSX.Element {
    return (
        <section
            aria-label="Days missed"
            className="bg-card ring-foreground/10 flex flex-col overflow-hidden rounded-xl shadow-sm ring-1"
        >
            <header className="border-border/60 flex items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold">Days missed</h2>
                    <p className="text-muted-foreground text-xs">
                        This academic year, newest first
                    </p>
                </div>
                <span className="bg-destructive/10 text-destructive ring-destructive/25 inline-flex min-w-8 items-center justify-center rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums ring-1">
                    {absences.length}
                </span>
            </header>

            {absences.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                    <span className="bg-success/12 text-success ring-success/25 flex size-11 items-center justify-center rounded-xl ring-1">
                        <PartyPopper className="size-5" />
                    </span>
                    <p className="text-sm font-semibold">Perfect record</p>
                    <p className="text-muted-foreground text-sm">
                        You haven&apos;t missed a single day this year.
                    </p>
                </div>
            ) : (
                <ul className="divide-border/60 max-h-104 divide-y overflow-y-auto">
                    {absences.map((date) => {
                        const value = toUtcDate(date);
                        const isSelected = date === selectedDate;

                        return (
                            <li key={date}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(date)}
                                    aria-pressed={isSelected}
                                    className={cn(
                                        "hover:bg-muted/50 focus-visible:bg-muted/50 flex w-full items-center gap-3 px-5 py-3 text-left transition-colors outline-none",
                                        isSelected && "bg-muted/60",
                                    )}
                                >
                                    <span className="bg-destructive/10 text-destructive ring-destructive/25 flex size-11 shrink-0 flex-col items-center justify-center rounded-lg leading-none ring-1">
                                        <span className="text-base font-bold tabular-nums">
                                            {value.getUTCDate()}
                                        </span>
                                        <span className="mt-0.5 text-[0.6rem] font-semibold uppercase">
                                            {monthShortFormatter.format(value)}
                                        </span>
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium">
                                            {weekdayFormatter.format(value)}
                                        </span>
                                        <span className="text-muted-foreground block text-xs">
                                            {daysAgo(date, today)}
                                        </span>
                                    </span>
                                    <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
