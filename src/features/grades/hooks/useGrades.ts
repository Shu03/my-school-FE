import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    enterGrades,
    getExamSubjectGrades,
    getExamSubjectSummary,
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
    examSubjectGrades: (examId: string, subjectId: string) =>
        [...gradesKeys.all, "exam", examId, "subject", subjectId] as const,
    examSubjectSummary: (examId: string, subjectId: string) =>
        [...gradesKeys.all, "exam", examId, "subject", subjectId, "summary"] as const,
    studentHistory: (studentId: string, params: StudentGradesParams) =>
        [...gradesKeys.all, "student", studentId, params] as const,
};

export function useExamSubjectGrades(
    examId: string | null,
    subjectId: string | null,
    enabled = true,
): UseQueryResult<Grade[]> {
    return useQuery({
        queryKey: gradesKeys.examSubjectGrades(examId ?? "", subjectId ?? ""),
        queryFn: () => getExamSubjectGrades(examId as string, subjectId as string),
        enabled: Boolean(examId) && Boolean(subjectId) && enabled,
    });
}

export function useExamSubjectSummary(
    examId: string | null,
    subjectId: string | null,
    enabled = true,
): UseQueryResult<ExamGradesSummary> {
    return useQuery({
        queryKey: gradesKeys.examSubjectSummary(examId ?? "", subjectId ?? ""),
        queryFn: () => getExamSubjectSummary(examId as string, subjectId as string),
        enabled: Boolean(examId) && Boolean(subjectId) && enabled,
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
    subjectId: string,
): UseMutationResult<BulkGradeResult, Error, BulkEnterGradesRequest> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => enterGrades(examId, subjectId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: gradesKeys.examSubjectGrades(examId, subjectId),
            });
            void queryClient.invalidateQueries({
                queryKey: gradesKeys.examSubjectSummary(examId, subjectId),
            });
        },
    });
}
