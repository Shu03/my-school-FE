import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    enterGrades,
    getExamGrades,
    getExamSummary,
    getStudentGradeHistory,
} from "../api/grades.api";
import type {
    BulkEnterGradesRequest,
    BulkGradeResult,
    ExamGradesSummary,
    Grade,
    StudentGradeHistory,
    StudentGradesParams,
} from "../types/grade.types";

/** Query-key factory for the grades feature. */
export const gradesKeys = {
    all: ["grades"] as const,
    examGrades: (examId: string) => [...gradesKeys.all, "exam", examId] as const,
    examSummary: (examId: string) => [...gradesKeys.all, "exam", examId, "summary"] as const,
    studentHistory: (studentId: string, params: StudentGradesParams) =>
        [...gradesKeys.all, "student", studentId, params] as const,
};

export function useExamGrades(examId: string | null, enabled = true): UseQueryResult<Grade[]> {
    return useQuery({
        queryKey: gradesKeys.examGrades(examId ?? ""),
        queryFn: () => getExamGrades(examId as string),
        enabled: Boolean(examId) && enabled,
    });
}

export function useExamSummary(
    examId: string | null,
    enabled = true,
): UseQueryResult<ExamGradesSummary> {
    return useQuery({
        queryKey: gradesKeys.examSummary(examId ?? ""),
        queryFn: () => getExamSummary(examId as string),
        enabled: Boolean(examId) && enabled,
    });
}

export function useStudentGradeHistory(
    studentId: string | null,
    params: StudentGradesParams,
    enabled = true,
): UseQueryResult<StudentGradeHistory> {
    return useQuery({
        queryKey: gradesKeys.studentHistory(studentId ?? "", params),
        queryFn: () => getStudentGradeHistory(studentId as string, params),
        enabled: Boolean(studentId) && enabled,
    });
}

export function useEnterGrades(
    examId: string,
): UseMutationResult<BulkGradeResult, Error, BulkEnterGradesRequest> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => enterGrades(examId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: gradesKeys.examGrades(examId) });
            void queryClient.invalidateQueries({ queryKey: gradesKeys.examSummary(examId) });
        },
    });
}
