/**
 * Placeholder dashboard data. The backend exposes no aggregate/summary endpoint yet,
 * so headline stats and activity feeds are represented with mock data to show the
 * product-ready shape of each persona home. Swap these exports for real query hooks
 * once summary endpoints exist — consumers only import from this module.
 */
import {
    BookOpen,
    CalendarCheck,
    ClipboardList,
    GraduationCap,
    NotebookPen,
    Percent,
    TrendingUp,
    Users,
} from "lucide-react";

type FeeStatus = "PENDING" | "PARTIAL" | "PAID";

export interface DashboardStat {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    /** Percentage change vs. last month. Positive = up, negative = down, 0 = flat. */
    trend: number;
    /** Relative data points (0–100) driving the sparkline shape. */
    series: number[];
}

export const ADMIN_STATS: DashboardStat[] = [
    {
        label: "Total Students",
        value: "1,234",
        icon: GraduationCap,
        trend: 12,
        series: [40, 44, 42, 52, 58, 64, 72, 80],
    },
    {
        label: "Total Teachers",
        value: "56",
        icon: Users,
        trend: 3,
        series: [30, 34, 33, 38, 40, 42, 46, 48],
    },
    {
        label: "Active Classes",
        value: "42",
        icon: BookOpen,
        trend: 0,
        series: [50, 48, 52, 49, 51, 50, 50, 50],
    },
    {
        label: "Attendance Rate",
        value: "94%",
        icon: TrendingUp,
        trend: 2,
        series: [78, 80, 76, 82, 85, 88, 90, 94],
    },
];

export const TEACHER_STATS: DashboardStat[] = [
    {
        label: "My Classes",
        value: "5",
        icon: BookOpen,
        trend: 0,
        series: [5, 5, 5, 5, 5, 5, 5, 5],
    },
    {
        label: "My Students",
        value: "148",
        icon: Users,
        trend: 4,
        series: [130, 134, 138, 140, 142, 144, 146, 148],
    },
    {
        label: "Homework Due",
        value: "7",
        icon: NotebookPen,
        trend: -2,
        series: [12, 11, 10, 9, 9, 8, 8, 7],
    },
    {
        label: "Grades Pending",
        value: "3",
        icon: ClipboardList,
        trend: -5,
        series: [9, 8, 7, 6, 5, 5, 4, 3],
    },
];

export const STUDENT_STATS: DashboardStat[] = [
    {
        label: "Attendance",
        value: "96%",
        icon: Percent,
        trend: 2,
        series: [88, 90, 91, 92, 93, 94, 95, 96],
    },
    {
        label: "Average Score",
        value: "82%",
        icon: TrendingUp,
        trend: 5,
        series: [70, 72, 74, 76, 78, 79, 81, 82],
    },
    {
        label: "Homework Due",
        value: "4",
        icon: NotebookPen,
        trend: 1,
        series: [2, 3, 3, 4, 3, 4, 4, 4],
    },
    {
        label: "Upcoming Exams",
        value: "2",
        icon: CalendarCheck,
        trend: 0,
        series: [1, 1, 2, 2, 2, 2, 2, 2],
    },
];

export interface TeacherScheduleItem {
    sectionId: string;
    className: string;
    subject: string;
    time: string;
    room: string;
}

export const TEACHER_SCHEDULE: TeacherScheduleItem[] = [
    { sectionId: "sec-8a", className: "Class 8 · A", subject: "Mathematics", time: "08:30", room: "R-201" },
    { sectionId: "sec-9b", className: "Class 9 · B", subject: "Mathematics", time: "09:30", room: "R-204" },
    { sectionId: "sec-10a", className: "Class 10 · A", subject: "Physics", time: "11:00", room: "Lab-1" },
    { sectionId: "sec-7c", className: "Class 7 · C", subject: "Mathematics", time: "12:30", room: "R-108" },
];

export interface GradingQueueItem {
    examId: string;
    examName: string;
    className: string;
    subject: string;
    pending: number;
    total: number;
}

export const TEACHER_GRADING_QUEUE: GradingQueueItem[] = [
    { examId: "exam-mid", examName: "Mid-Term", className: "Class 10 · A", subject: "Physics", pending: 12, total: 34 },
    { examId: "exam-unit2", examName: "Unit Test 2", className: "Class 9 · B", subject: "Mathematics", pending: 30, total: 30 },
    { examId: "exam-unit2b", examName: "Unit Test 2", className: "Class 8 · A", subject: "Mathematics", pending: 6, total: 32 },
];

export interface StudentClassItem {
    subject: string;
    teacher: string;
    time: string;
    room: string;
}

export const STUDENT_TIMETABLE: StudentClassItem[] = [
    { subject: "Mathematics", teacher: "Mr. Rao", time: "08:30", room: "R-201" },
    { subject: "English", teacher: "Ms. Fernandes", time: "09:30", room: "R-115" },
    { subject: "Physics", teacher: "Mr. Iyer", time: "11:00", room: "Lab-1" },
    { subject: "History", teacher: "Ms. Kulkarni", time: "12:30", room: "R-108" },
];

export type StudentHomeworkStatus = "DUE" | "SUBMITTED" | "OVERDUE";

export interface StudentHomeworkItem {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: StudentHomeworkStatus;
}

export const STUDENT_HOMEWORK: StudentHomeworkItem[] = [
    { id: "hw-1", title: "Algebra worksheet 4", subject: "Mathematics", dueDate: "Tomorrow", status: "DUE" },
    { id: "hw-2", title: "Essay: My hometown", subject: "English", dueDate: "In 2 days", status: "DUE" },
    { id: "hw-3", title: "Newton's laws problems", subject: "Physics", dueDate: "Today", status: "OVERDUE" },
    { id: "hw-4", title: "Map of trade routes", subject: "History", dueDate: "Submitted", status: "SUBMITTED" },
];

export type StudentExamStatus = "UPCOMING" | "RESULT";

export interface StudentExamItem {
    id: string;
    examName: string;
    subject: string;
    date: string;
    status: StudentExamStatus;
    marksObtained?: number;
    totalMarks?: number;
}

export const STUDENT_EXAMS: StudentExamItem[] = [
    { id: "ex-1", examName: "Mid-Term", subject: "Physics", date: "12 Sep", status: "UPCOMING" },
    { id: "ex-2", examName: "Mid-Term", subject: "Mathematics", date: "14 Sep", status: "UPCOMING" },
    { id: "ex-3", examName: "Unit Test 2", subject: "English", date: "28 Aug", status: "RESULT", marksObtained: 41, totalMarks: 50 },
];

export interface StudentFeeSummaryMock {
    totalAmount: number;
    amountPaid: number;
    status: FeeStatus;
    dueDate: string;
}

export const STUDENT_FEE_SUMMARY: StudentFeeSummaryMock = {
    totalAmount: 48000,
    amountPaid: 32000,
    status: "PARTIAL",
    dueDate: "30 Sep 2026",
};

export interface AnnouncementPreview {
    id: string;
    title: string;
    content: string;
    date: string;
    author: string;
}

export const RECENT_ANNOUNCEMENTS: AnnouncementPreview[] = [
    {
        id: "an-1",
        title: "Annual Sports Day",
        content: "Sports Day is scheduled for 20 September. Practice sessions begin next week.",
        date: "2 days ago",
        author: "Principal's Office",
    },
    {
        id: "an-2",
        title: "PTM — Class 8 to 10",
        content: "Parent-teacher meetings for senior classes will be held on Saturday.",
        date: "4 days ago",
        author: "Academic Coordinator",
    },
];

export interface ReportCardSummaryMock {
    term: string;
    overallPercentage: number;
    rank: number;
    classSize: number;
}

export const STUDENT_REPORT_SUMMARY: ReportCardSummaryMock = {
    term: "Term 1",
    overallPercentage: 82,
    rank: 6,
    classSize: 34,
};
