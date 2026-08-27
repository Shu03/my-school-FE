import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    getAttendanceSummary,
    getClassAttendance,
    getStudentAttendance,
    markAttendance,
} from "../api/attendance.api";
import type {
    AttendanceRecord,
    AttendanceSummaryItem,
    AttendanceSummaryParams,
    BulkMarkResult,
    ClassAttendanceParams,
    MarkAttendanceRequest,
    StudentAttendanceParams,
} from "../types/attendance.types";

/** Query-key factory for the attendance feature. */
export const attendanceKeys = {
    all: ["attendance"] as const,
    class: (params: ClassAttendanceParams) => [...attendanceKeys.all, "class", params] as const,
    student: (studentId: string, params: StudentAttendanceParams) =>
        [...attendanceKeys.all, "student", studentId, params] as const,
    summary: (params: AttendanceSummaryParams) =>
        [...attendanceKeys.all, "summary", params] as const,
};

export function useClassAttendance(
    params: ClassAttendanceParams,
    enabled: boolean,
): UseQueryResult<AttendanceRecord[]> {
    return useQuery({
        queryKey: attendanceKeys.class(params),
        queryFn: () => getClassAttendance(params),
        enabled,
    });
}

export function useStudentAttendance(
    studentId: string | null,
    params: StudentAttendanceParams,
    enabled: boolean,
): UseQueryResult<AttendanceRecord[]> {
    return useQuery({
        queryKey: attendanceKeys.student(studentId ?? "", params),
        queryFn: () => getStudentAttendance(studentId as string, params),
        enabled: enabled && Boolean(studentId),
    });
}

export function useAttendanceSummary(
    params: AttendanceSummaryParams,
    enabled: boolean,
): UseQueryResult<AttendanceSummaryItem[]> {
    return useQuery({
        queryKey: attendanceKeys.summary(params),
        queryFn: () => getAttendanceSummary(params),
        enabled,
    });
}

export function useMarkAttendance(): UseMutationResult<
    BulkMarkResult,
    Error,
    MarkAttendanceRequest
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAttendance,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
        },
    });
}
