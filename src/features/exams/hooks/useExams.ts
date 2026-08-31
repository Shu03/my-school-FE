import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    createExam,
    discardExam,
    finalizeExam,
    getExamById,
    listExams,
    unlockExam,
    updateExam,
} from "../api/exams.api";
import type {
    CreateExamRequest,
    Exam,
    ExamsListParams,
    ExamsListResponse,
    ExamWithSummary,
    UpdateExamRequest,
} from "../types/exam.types";

/** Query-key factory for the exams feature. */
export const examsKeys = {
    all: ["exams"] as const,
    lists: () => [...examsKeys.all, "list"] as const,
    list: (params: ExamsListParams) => [...examsKeys.lists(), params] as const,
    details: () => [...examsKeys.all, "detail"] as const,
    detail: (id: string) => [...examsKeys.details(), id] as const,
};

export function useExamsList(params: ExamsListParams): UseQueryResult<ExamsListResponse> {
    return useQuery({
        queryKey: examsKeys.list(params),
        queryFn: () => listExams(params),
    });
}

export function useExam(id: string | null): UseQueryResult<ExamWithSummary> {
    return useQuery({
        queryKey: examsKeys.detail(id ?? ""),
        queryFn: () => getExamById(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateExam(): UseMutationResult<Exam, Error, CreateExamRequest> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createExam,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: examsKeys.lists() });
        },
    });
}

export function useUpdateExam(): UseMutationResult<
    Exam,
    Error,
    { id: string; data: UpdateExamRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateExam(id, data),
        onSuccess: (exam) => {
            void queryClient.invalidateQueries({ queryKey: examsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: examsKeys.detail(exam.id) });
        },
    });
}

export function useFinalizeExam(): UseMutationResult<Exam, Error, { id: string }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => finalizeExam(id),
        onSuccess: (exam) => {
            void queryClient.invalidateQueries({ queryKey: examsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: examsKeys.detail(exam.id) });
        },
    });
}

export function useUnlockExam(): UseMutationResult<Exam, Error, { id: string }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => unlockExam(id),
        onSuccess: (exam) => {
            void queryClient.invalidateQueries({ queryKey: examsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: examsKeys.detail(exam.id) });
        },
    });
}

export function useDiscardExam(): UseMutationResult<Exam, Error, { id: string }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => discardExam(id),
        onSuccess: (exam) => {
            void queryClient.invalidateQueries({ queryKey: examsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: examsKeys.detail(exam.id) });
        },
    });
}
