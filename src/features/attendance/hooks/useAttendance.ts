import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    deleteAttendanceDay,
    getAttendanceDay,
    getAttendanceSummary,
    getStudentAttendance,
    saveAttendanceDay,
} from "../api/attendance.api";
import type {
    AttendanceDayView,
    AttendanceSummaryItem,
    AttendanceSummaryParams,
    ClassAttendanceParams,
    SaveAttendanceDayRequest,
    StudentAttendanceItem,
    StudentAttendanceParams,
} from "../types/attendance.types";

/** Query-key factory for the attendance feature. */
export const attendanceKeys = {
    all: ["attendance"] as const,
    day: (params: ClassAttendanceParams) => [...attendanceKeys.all, "day", params] as const,
    student: (studentId: string, params: StudentAttendanceParams) =>
        [...attendanceKeys.all, "student", studentId, params] as const,
    summary: (params: AttendanceSummaryParams) =>
        [...attendanceKeys.all, "summary", params] as const,
};

export function useAttendanceDay(
    params: ClassAttendanceParams,
    enabled: boolean,
): UseQueryResult<AttendanceDayView> {
    return useQuery<AttendanceDayView>({
        queryKey: attendanceKeys.day(params),
        queryFn: () => getAttendanceDay(params),
        enabled,
    });
}

export function useStudentAttendance(
    studentId: string | null,
    params: StudentAttendanceParams,
    enabled: boolean,
): UseQueryResult<StudentAttendanceItem[]> {
    return useQuery<StudentAttendanceItem[]>({
        queryKey: attendanceKeys.student(studentId ?? "", params),
        queryFn: () => getStudentAttendance(studentId as string, params),
        enabled: enabled && Boolean(studentId),
    });
}

export function useAttendanceSummary(
    params: AttendanceSummaryParams,
    enabled: boolean,
): UseQueryResult<AttendanceSummaryItem[]> {
    return useQuery<AttendanceSummaryItem[]>({
        queryKey: attendanceKeys.summary(params),
        queryFn: () => getAttendanceSummary(params),
        enabled,
    });
}

export function useSaveAttendanceDay(): UseMutationResult<
    AttendanceDayView,
    Error,
    { params: ClassAttendanceParams; data: SaveAttendanceDayRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            params,
            data,
        }: {
            params: ClassAttendanceParams;
            data: SaveAttendanceDayRequest;
        }) => saveAttendanceDay(params, data),
        onSuccess: () => {
            return queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
        },
    });
}

export function useDeleteAttendanceDay(): UseMutationResult<void, Error, ClassAttendanceParams> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAttendanceDay,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
    });
}
