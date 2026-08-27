/** School timezone used to resolve "today" for attendance marking. */
export const SCHOOL_TIMEZONE = "Asia/Kolkata";

/** Attendance status values (mirrors backend enum). */
export const ATTENDANCE_STATUS = {
    PRESENT: "PRESENT",
    ABSENT: "ABSENT",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const ATTENDANCE_STATUS_LIST: AttendanceStatus[] = Object.values(ATTENDANCE_STATUS);

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
    PRESENT: "Present",
    ABSENT: "Absent",
};

/** Max students loaded when marking attendance for a class. */
export const ATTENDANCE_STUDENT_LIMIT = 100;
