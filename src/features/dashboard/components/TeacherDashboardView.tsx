import type { JSX } from "react";

import { Link } from "react-router-dom";

import {
    BookOpen,
    CalendarCheck,
    CheckCircle2,
    CircleDashed,
    ClipboardList,
    KeyRound,
    NotebookPen,
    PenLine,
    Sun,
    Users,
} from "lucide-react";

import { TEACHER_CLASS_ROLE_LABELS } from "@constants/dashboard.constants";
import {
    attendancePage,
    classDetail,
    examDetail,
    examSubjectDetail,
    ROUTES,
} from "@constants/routes.constants";

import { formatSectionLabel } from "@lib/section";

import { Stagger, StaggerItem } from "@components/common/Motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { percentOf, pluralize } from "../lib/format";
import type {
    PendingGradingItem,
    TeacherAssignmentItem,
    TeacherDashboard,
} from "../types/dashboard.types";

import { AnnouncementList } from "./AnnouncementList";
import { ExamSubjectRow } from "./ExamSubjectRow";
import { HolidayList } from "./HolidayList";
import { ProgressBar } from "./Meters";
import { EmptyState, SectionCard } from "./SectionCard";
import { StatCard } from "./StatCard";
import { StatusChip } from "./StatusChip";
import { UpcomingExamsCard } from "./UpcomingExamsCard";

interface SectionGroup {
    sectionId: string;
    sectionName: string;
    classLevel: number;
    studentCount: number;
    isClassTeacher: boolean;
    subjects: string[];
}

/** One section can appear as both CLASS_TEACHER and SUBJECT_TEACHER rows; keep backend order. */
function groupBySection(assignments: TeacherAssignmentItem[]): SectionGroup[] {
    const groups = new Map<string, SectionGroup>();
    for (const row of assignments) {
        const group = groups.get(row.sectionId) ?? {
            sectionId: row.sectionId,
            sectionName: row.sectionName,
            classLevel: row.classLevel,
            studentCount: row.studentCount,
            isClassTeacher: false,
            subjects: [],
        };
        if (row.role === "CLASS_TEACHER") {
            group.isClassTeacher = true;
        } else if (row.subjectName) {
            group.subjects.push(row.subjectName);
        }
        groups.set(row.sectionId, group);
    }
    return [...groups.values()];
}

function AssignmentsCard({
    groups,
    className,
}: {
    groups: SectionGroup[];
    className?: string;
}): JSX.Element {
    return (
        <SectionCard
            icon={BookOpen}
            title="My assignments"
            description="Sections you teach this year"
            action={{ label: "View classes", to: ROUTES.CLASSES }}
            className={className}
        >
            {groups.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    message="You have no class assignments for this academic year."
                />
            ) : (
                <div className="@container">
                    <ul className="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-3">
                        {groups.map((group) => (
                            <li key={group.sectionId}>
                                <Link
                                    to={classDetail(group.sectionId)}
                                    className="group border-border/70 hover:border-primary/40 hover:bg-primary/3 focus-visible:ring-ring/50 flex h-full gap-3 rounded-xl border p-3 transition-colors outline-none focus-visible:ring-2"
                                >
                                    <span
                                        className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-12 shrink-0 flex-col items-center justify-center rounded-xl ring-1"
                                        aria-hidden="true"
                                    >
                                        <span className="text-lg leading-none font-bold tabular-nums">
                                            {group.classLevel}
                                        </span>
                                        <span className="mt-0.5 max-w-10 truncate text-[0.65rem] font-semibold">
                                            {group.sectionName}
                                        </span>
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="group-hover:text-primary truncate text-sm font-semibold transition-colors">
                                            {formatSectionLabel(
                                                group.classLevel,
                                                group.sectionName,
                                            )}
                                        </h3>
                                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                                            <Users className="size-3" aria-hidden="true" />
                                            {pluralize(group.studentCount, "student")}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {group.isClassTeacher ? (
                                                <StatusChip tone="primary">
                                                    {TEACHER_CLASS_ROLE_LABELS.CLASS_TEACHER}
                                                </StatusChip>
                                            ) : null}
                                            {group.subjects.map((subject) => (
                                                <StatusChip
                                                    key={subject}
                                                    tone="muted"
                                                    className="font-medium"
                                                >
                                                    {TEACHER_CLASS_ROLE_LABELS.SUBJECT_TEACHER}:{" "}
                                                    {subject}
                                                </StatusChip>
                                            ))}
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

function AttendanceTodayCard({
    data,
    groups,
}: {
    data: TeacherDashboard["attendanceToday"];
    groups: SectionGroup[];
}): JSX.Element | null {
    if (!data.isSchoolDay) {
        return (
            <SectionCard
                icon={CalendarCheck}
                title="Today's attendance"
                description="Your class-teacher sections"
            >
                <EmptyState
                    icon={Sun}
                    message="No school today"
                    hint="It's a holiday or weekly off, so attendance isn't taken."
                />
            </SectionCard>
        );
    }

    if (data.sections.length === 0) {
        return null;
    }

    const markedCount = data.sections.filter((section) => section.marked).length;
    const classLevelById = new Map(groups.map((group) => [group.sectionId, group.classLevel]));

    return (
        <SectionCard
            icon={CalendarCheck}
            title="Today's attendance"
            description="Your class-teacher sections"
            headerExtra={
                <StatusChip tone={markedCount === data.sections.length ? "success" : "warning"} dot>
                    {markedCount} / {data.sections.length} marked
                </StatusChip>
            }
        >
            <ul className="divide-border/60 divide-y">
                {data.sections.map((section) => {
                    const classLevel = classLevelById.get(section.sectionId);
                    const label =
                        classLevel === undefined
                            ? section.sectionName
                            : formatSectionLabel(classLevel, section.sectionName);
                    return (
                        <li
                            key={section.sectionId}
                            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        "flex size-9 items-center justify-center rounded-full ring-1",
                                        section.marked
                                            ? "bg-success/12 text-success ring-success/25"
                                            : "bg-warning/12 text-warning ring-warning/25",
                                    )}
                                    aria-hidden="true"
                                >
                                    {section.marked ? (
                                        <CheckCircle2 className="size-4.5" />
                                    ) : (
                                        <CircleDashed className="size-4.5" />
                                    )}
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold">{label}</h3>
                                    <StatusChip
                                        tone={section.marked ? "success" : "warning"}
                                        className="mt-1"
                                    >
                                        {section.marked ? "Marked" : "Not marked"}
                                    </StatusChip>
                                </div>
                            </div>
                            {section.marked ? null : (
                                <Button asChild size="sm">
                                    <Link to={attendancePage("mark", section.sectionId)}>
                                        <CalendarCheck className="size-3.5" />
                                        Take attendance
                                    </Link>
                                </Button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </SectionCard>
    );
}

function GradingRow({ item, today }: { item: PendingGradingItem; today: string }): JSX.Element {
    const gradedPercent = percentOf(item.graded, item.totalStudents);
    return (
        <ExamSubjectRow
            item={item}
            today={today}
            to={examDetail(item.examId)}
            aside={
                <Button asChild size="sm" variant="outline">
                    <Link to={examSubjectDetail(item.examId, item.subjectId)}>
                        <PenLine className="size-3.5" />
                        Enter marks
                    </Link>
                </Button>
            }
        >
            <div className="mt-2 flex items-center gap-2">
                <ProgressBar
                    value={gradedPercent}
                    label={`${item.subjectName} marks entered`}
                    tone={gradedPercent === 100 ? "success" : "warning"}
                    className="h-1.5 max-w-48"
                />
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {item.graded} / {item.totalStudents} graded
                </span>
            </div>
        </ExamSubjectRow>
    );
}

function PendingGradingCard({
    pending,
    today,
}: {
    pending: TeacherDashboard["exams"]["pendingGrading"];
    today: string;
}): JSX.Element {
    const remaining = pending.count - pending.items.length;

    return (
        <SectionCard
            icon={ClipboardList}
            title="Pending grading"
            description="Past exams still awaiting marks"
            action={{ label: "View all", to: ROUTES.EXAMS }}
        >
            {pending.items.length === 0 ? (
                <EmptyState
                    icon={CheckCircle2}
                    message="All caught up — no grading pending."
                    hint="Covers every subject in your class-teacher sections and your own subjects elsewhere."
                />
            ) : (
                <>
                    <ul className="divide-border/60 divide-y">
                        {pending.items.map((item) => (
                            <GradingRow key={item.examSubjectId} item={item} today={today} />
                        ))}
                    </ul>
                    {remaining > 0 ? (
                        <Link
                            to={ROUTES.EXAMS}
                            className="text-primary focus-visible:ring-ring/50 mt-4 inline-flex rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
                        >
                            +{remaining} more
                        </Link>
                    ) : null}
                </>
            )}
        </SectionCard>
    );
}

export function TeacherDashboardView({ data }: { data: TeacherDashboard }): JSX.Element {
    const groups = groupBySection(data.assignments);
    const totalStudents = groups.reduce((sum, group) => sum + group.studentCount, 0);
    const pendingGrading = data.exams.pendingGrading.count;
    const attendanceHidden =
        data.attendanceToday.isSchoolDay && data.attendanceToday.sections.length === 0;

    return (
        <div className="flex flex-col gap-6">
            <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StaggerItem>
                    <StatCard
                        label="My classes"
                        value={groups.length}
                        icon={BookOpen}
                        hint={pluralize(totalStudents, "student")}
                        to={ROUTES.CLASSES}
                    />
                </StaggerItem>
                <StaggerItem>
                    <StatCard
                        label="Pending grading"
                        value={pendingGrading}
                        icon={ClipboardList}
                        tone={pendingGrading > 0 ? "warning" : "primary"}
                        hint={pendingGrading > 0 ? "Exam subjects awaiting marks" : "All caught up"}
                        to={ROUTES.EXAMS}
                    />
                </StaggerItem>
                <StaggerItem>
                    <StatCard
                        label="Active homework"
                        value={data.activeHomeworkCount}
                        icon={NotebookPen}
                        hint="Due today or later"
                        to={ROUTES.HOMEWORK}
                    />
                </StaggerItem>
                <StaggerItem>
                    <StatCard
                        label="My access requests"
                        value={
                            <>
                                {data.accessRequests.PENDING}
                                <span className="text-muted-foreground ml-1.5 text-sm font-medium">
                                    pending
                                </span>
                            </>
                        }
                        icon={KeyRound}
                        hint={pluralize(data.accessRequests.APPROVED, "active grant")}
                        to={ROUTES.REQUEST_ACCESS}
                    />
                </StaggerItem>
            </Stagger>

            <div className="grid gap-6 lg:grid-cols-2">
                <AssignmentsCard
                    groups={groups}
                    className={attendanceHidden ? "lg:col-span-2" : undefined}
                />
                <AttendanceTodayCard data={data.attendanceToday} groups={groups} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <PendingGradingCard pending={data.exams.pendingGrading} today={data.today} />
                <UpcomingExamsCard items={data.exams.upcoming} today={data.today} linkable />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <AnnouncementList items={data.announcements} />
                <HolidayList items={data.upcomingHolidays} today={data.today} />
            </div>
        </div>
    );
}
