export type AttendanceDayStatus = "PRESENT" | "ABSENT";

export interface AttendanceDayStudent {
    studentId: string;
    rollNumber: string;
    firstName: string;
    lastName: string;
    status: AttendanceDayStatus | null;
}

export interface AttendanceDayView {
    sectionId: string;
    date: string;
    isTaken: boolean;
    markedBy: { id: string; firstName: string; lastName: string } | null;
    markedAt: string | null;
    students: AttendanceDayStudent[];
}

export interface SaveAttendanceDayRequest {
    absentStudentIds: string[];
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

export interface StudentAttendanceItem {
    date: string;
    sectionId: string;
    status: AttendanceDayStatus;
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
