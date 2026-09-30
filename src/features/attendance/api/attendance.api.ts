import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AttendanceDayView,
    AttendanceSummaryItem,
    AttendanceSummaryParams,
    ClassAttendanceParams,
    SaveAttendanceDayRequest,
    StudentAttendanceItem,
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

export function getAttendanceDay(params: ClassAttendanceParams): Promise<AttendanceDayView> {
    return apiFetch(API_ENDPOINTS.ATTENDANCE.day(params.sectionId, params.date), {
        method: "GET",
    });
}

export function saveAttendanceDay(
    params: ClassAttendanceParams,
    data: SaveAttendanceDayRequest,
): Promise<AttendanceDayView> {
    return apiFetch(API_ENDPOINTS.ATTENDANCE.day(params.sectionId, params.date), {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteAttendanceDay(params: ClassAttendanceParams): Promise<void> {
    return apiFetch(API_ENDPOINTS.ATTENDANCE.day(params.sectionId, params.date), {
        method: "DELETE",
    });
}

export async function getStudentAttendance(
    studentId: string,
    params: StudentAttendanceParams,
): Promise<StudentAttendanceItem[]> {
    const queryString = buildQuery({
        academicYearId: params.academicYearId,
        startDate: params.startDate,
        endDate: params.endDate,
    });

    const endpoint = queryString
        ? `${API_ENDPOINTS.ATTENDANCE.byStudent(studentId)}?${queryString}`
        : API_ENDPOINTS.ATTENDANCE.byStudent(studentId);

    return apiFetch<StudentAttendanceItem[]>(endpoint, {
        method: "GET",
    });
}

export async function getAttendanceSummary(
    params: AttendanceSummaryParams,
): Promise<AttendanceSummaryItem[]> {
    const queryString = buildQuery({ sectionId: params.sectionId, month: params.month });

    return apiFetch<AttendanceSummaryItem[]>(`${API_ENDPOINTS.ATTENDANCE.SUMMARY}?${queryString}`, {
        method: "GET",
    });
}
