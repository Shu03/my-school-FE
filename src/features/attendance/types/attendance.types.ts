import type { AttendanceStatus } from "@constants/attendance.constants";

export interface AttendanceStudentUser {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string | null;
    role: "STUDENT";
    isActive: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
}

export interface AttendanceStudent {
    id: string;
    userId: string;
    admissionNumber: string;
    dateOfBirth: string | null;
    createdAt: string;
    updatedAt: string;
    user: AttendanceStudentUser;
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    sectionId: string;
    academicYearId: string;
    date: string;
    status: AttendanceStatus;
    markedById: string | null;
    periodId: string | null;
    createdAt: string;
    updatedAt: string;
    student: AttendanceStudent;
}

export interface MarkAttendanceRecord {
    studentId: string;
    status: AttendanceStatus;
}

export interface MarkAttendanceRequest {
    sectionId: string;
    date: string;
    records: MarkAttendanceRecord[];
}

export interface BulkMarkResult {
    marked: number;
    date: string;
    sectionId: string;
}

export interface ClassAttendanceParams {
    sectionId: string;
    date: string;
}

export interface StudentAttendanceParams {
    academicYearId?: string;
    startDate?: string;
    endDate?: string;
}

export interface AttendanceSummaryParams {
    sectionId: string;
    month: string;
}

export interface AttendanceSummaryItem {
    studentId: string;
    firstName: string;
    lastName: string;
    totalDays: number;
    present: number;
    absent: number;
    percentage: number;
}
