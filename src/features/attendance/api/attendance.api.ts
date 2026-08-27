import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AttendanceRecord,
    AttendanceSummaryItem,
    AttendanceSummaryParams,
    BulkMarkResult,
    ClassAttendanceParams,
    MarkAttendanceRequest,
    StudentAttendanceParams,
} from "../types/attendance.types";

function buildQuery(params: Record<string, string | undefined>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value);
        }
    });

    return searchParams.toString();
}

export async function markAttendance(data: MarkAttendanceRequest): Promise<BulkMarkResult> {
    return apiFetch<BulkMarkResult>(API_ENDPOINTS.ATTENDANCE.MARK, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getClassAttendance(
    params: ClassAttendanceParams,
): Promise<AttendanceRecord[]> {
    const queryString = buildQuery({ classId: params.classId, date: params.date });

    return apiFetch<AttendanceRecord[]>(`${API_ENDPOINTS.ATTENDANCE.BASE}?${queryString}`, {
        method: "GET",
    });
}

export async function getStudentAttendance(
    studentId: string,
    params: StudentAttendanceParams,
): Promise<AttendanceRecord[]> {
    const queryString = buildQuery({
        academicYearId: params.academicYearId,
        startDate: params.startDate,
        endDate: params.endDate,
    });

    const endpoint = queryString
        ? `${API_ENDPOINTS.ATTENDANCE.byStudent(studentId)}?${queryString}`
        : API_ENDPOINTS.ATTENDANCE.byStudent(studentId);

    return apiFetch<AttendanceRecord[]>(endpoint, {
        method: "GET",
    });
}

export async function getAttendanceSummary(
    params: AttendanceSummaryParams,
): Promise<AttendanceSummaryItem[]> {
    const queryString = buildQuery({ classId: params.classId, month: params.month });

    return apiFetch<AttendanceSummaryItem[]>(`${API_ENDPOINTS.ATTENDANCE.SUMMARY}?${queryString}`, {
        method: "GET",
    });
}
