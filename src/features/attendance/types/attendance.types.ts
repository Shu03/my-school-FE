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
    classId: string;
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
    classId: string;
    date: string;
    records: MarkAttendanceRecord[];
}

export interface BulkMarkResult {
    marked: number;
    date: string;
    classId: string;
}

export interface ClassAttendanceParams {
    classId: string;
    date: string;
}

export interface StudentAttendanceParams {
    academicYearId?: string;
    startDate?: string;
    endDate?: string;
}

export interface AttendanceSummaryParams {
    classId: string;
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
