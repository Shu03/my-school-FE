import type { ExamType } from "@constants/exams.constants";
import type { FeeStatus } from "@constants/fees.constants";

import type { Role } from "@/types/api";

import type { AccessRequestStatus } from "@features/request-access";
import type { TeacherClassRole } from "@features/teachers";

export type { AccessRequestStatus, ExamType, Role, TeacherClassRole };
export type FeeRecordStatus = FeeStatus;

/** Real timestamp, e.g. "2026-09-30T08:15:00.000Z". */
export type ISODateTime = string;
/** Calendar date stored as UTC midnight, e.g. "2026-10-02T00:00:00.000Z". */
export type ISODateOnly = string;

export interface AnnouncementItem {
    id: string;
    title: string;
    content: string;
    startDate: ISODateTime;
    endDate: ISODateTime;
}

export interface HolidayItem {
    id: string;
    name: string;
    date: ISODateOnly;
}

/** One row per exam SUBJECT (not per exam). */
export interface ExamSubjectItem {
    examSubjectId: string;
    examId: string;
    examName: string;
    examType: ExamType;
    sectionId: string;
    sectionName: string;
    classLevel: number;
    subjectId: string;
    subjectName: string;
    date: ISODateOnly;
    totalMarks: number;
}

export interface PendingGradingItem extends ExamSubjectItem {
    graded: number;
    totalStudents: number;
}

export interface ExamResultItem {
    examId: string;
    examName: string;
    examType: ExamType;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
}

export interface AttendanceCounts {
    totalDays: number;
    present: number;
    absent: number;
    percentage: number;
}

interface DashboardCommon {
    academicYear: { id: string; name: string };
    /** "YYYY-MM-DD" in the school timezone — use instead of the device clock. */
    today: string;
    announcements: AnnouncementItem[];
    upcomingHolidays: HolidayItem[];
}

export type AdminAttendanceToday =
    | { isSchoolDay: false }
    | {
          isSchoolDay: true;
          sectionsMarked: number;
          sectionsPending: number;
          absentees: number;
          presentPercentage: number;
      };

export interface AdminDashboard extends DashboardCommon {
    role: "ADMIN";
    counts: { students: number; teachers: number; sections: number };
    enrollmentByClassLevel: { classLevel: number; students: number }[];
    attendanceToday: AdminAttendanceToday;
    fees: {
        expected: number;
        collected: number;
        outstanding: number;
        byStatus: Record<FeeRecordStatus, number>;
    };
    accounts: {
        totalDeposited: string;
        totalWithdrawn: string;
        totalSpent: string;
        totalBalance: string;
        withdrawnBalance: string;
    };
    pendingAccessRequests: number;
    exams: { upcoming: ExamSubjectItem[]; notFinalizedCount: number };
}

export interface TeacherAssignmentItem {
    sectionId: string;
    sectionName: string;
    classLevel: number;
    subjectId: string | null;
    subjectName: string | null;
    role: TeacherClassRole;
    studentCount: number;
}

export type TeacherAttendanceToday =
    | { isSchoolDay: false }
    | {
          isSchoolDay: true;
          sections: { sectionId: string; sectionName: string; marked: boolean }[];
      };

export interface TeacherDashboard extends DashboardCommon {
    role: "TEACHER";
    assignments: TeacherAssignmentItem[];
    attendanceToday: TeacherAttendanceToday;
    exams: {
        upcoming: ExamSubjectItem[];
        pendingGrading: { count: number; items: PendingGradingItem[] };
    };
    activeHomeworkCount: number;
    accessRequests: Record<AccessRequestStatus, number>;
}

export interface StudentEnrollment {
    sectionId: string;
    sectionName: string;
    classLevel: number;
    rollNumber: string;
    classTeacher: { firstName: string; lastName: string } | null;
}

export interface StudentFees {
    total: number;
    paid: number;
    due: number;
    status: FeeRecordStatus;
    dueDate: ISODateOnly;
}

export interface HomeworkDueItem {
    id: string;
    title: string;
    subjectName: string;
    dueDate: ISODateOnly;
}

export interface StudentDashboard extends DashboardCommon {
    role: "STUDENT";
    enrollment: StudentEnrollment | null;
    attendance: { year: AttendanceCounts; month: AttendanceCounts } | null;
    fees: StudentFees | null;
    homeworkDueSoon: HomeworkDueItem[] | null;
    exams: { upcoming: ExamSubjectItem[]; recentResults: ExamResultItem[] } | null;
}

export type DashboardResponse = AdminDashboard | TeacherDashboard | StudentDashboard;
