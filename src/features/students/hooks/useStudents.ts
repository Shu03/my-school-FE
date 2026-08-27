import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    enrollStudent,
    getStudentById,
    listEnrollments,
    listStudents,
    promoteStudents,
    updateEnrollment,
    updateStudent,
} from "../api/students.api";
import type {
    EnrollStudentRequest,
    PromoteStudentsRequest,
    PromoteStudentsResponse,
    StudentEnrollment,
    StudentProfile,
    StudentProfileWithEnrollments,
    StudentsListParams,
    StudentsListResponse,
    UpdateEnrollmentRequest,
    UpdateStudentRequest,
} from "../types/student.types";

/** Query-key factory for the students feature. */
export const studentsKeys = {
    all: ["students"] as const,
    lists: () => [...studentsKeys.all, "list"] as const,
    list: (params: StudentsListParams) => [...studentsKeys.lists(), params] as const,
    details: () => [...studentsKeys.all, "detail"] as const,
    detail: (id: string) => [...studentsKeys.details(), id] as const,
    enrollments: (id: string) => [...studentsKeys.all, "enrollments", id] as const,
};

export function useStudentsList(params: StudentsListParams): UseQueryResult<StudentsListResponse> {
    return useQuery({
        queryKey: studentsKeys.list(params),
        queryFn: () => listStudents(params),
    });
}

export function useStudent(id: string | null): UseQueryResult<StudentProfileWithEnrollments> {
    return useQuery({
        queryKey: studentsKeys.detail(id ?? ""),
        queryFn: () => getStudentById(id as string),
        enabled: Boolean(id),
    });
}

export function useStudentEnrollments(id: string | null): UseQueryResult<StudentEnrollment[]> {
    return useQuery({
        queryKey: studentsKeys.enrollments(id ?? ""),
        queryFn: () => listEnrollments(id as string),
        enabled: Boolean(id),
    });
}

export function useUpdateStudent(): UseMutationResult<
    StudentProfile,
    Error,
    { id: string; data: UpdateStudentRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateStudent(id, data),
        onSuccess: (student) => {
            void queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: studentsKeys.detail(student.id) });
        },
    });
}

export function useEnrollStudent(): UseMutationResult<
    StudentEnrollment,
    Error,
    { id: string; data: EnrollStudentRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => enrollStudent(id, data),
        onSuccess: (enrollment) => {
            void queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
            void queryClient.invalidateQueries({
                queryKey: studentsKeys.detail(enrollment.studentId),
            });
            void queryClient.invalidateQueries({
                queryKey: studentsKeys.enrollments(enrollment.studentId),
            });
        },
    });
}

export function useUpdateEnrollment(): UseMutationResult<
    StudentEnrollment,
    Error,
    { id: string; enrollmentId: string; data: UpdateEnrollmentRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, enrollmentId, data }) => updateEnrollment(id, enrollmentId, data),
        onSuccess: (enrollment) => {
            void queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
            void queryClient.invalidateQueries({
                queryKey: studentsKeys.detail(enrollment.studentId),
            });
            void queryClient.invalidateQueries({
                queryKey: studentsKeys.enrollments(enrollment.studentId),
            });
        },
    });
}

export function usePromoteStudents(): UseMutationResult<
    PromoteStudentsResponse,
    Error,
    PromoteStudentsRequest
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: promoteStudents,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: studentsKeys.all });
        },
    });
}
