import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    createSubject,
    deleteSubject,
    getSubjectById,
    listSubjects,
    updateSubject,
} from "../api/subjects.api";
import type {
    CreateSubjectRequest,
    Subject,
    SubjectWithAssignments,
    SubjectsListParams,
    UpdateSubjectRequest,
} from "../types/subject.types";

export const subjectsKeys = {
    all: ["subjects"] as const,
    lists: () => [...subjectsKeys.all, "list"] as const,
    list: (params: SubjectsListParams) => [...subjectsKeys.lists(), params] as const,
    details: () => [...subjectsKeys.all, "detail"] as const,
    detail: (id: string) => [...subjectsKeys.details(), id] as const,
};

export function useSubjectsList(params: SubjectsListParams): UseQueryResult<Subject[]> {
    return useQuery({
        queryKey: subjectsKeys.list(params),
        queryFn: () => listSubjects(params),
    });
}

export function useSubject(id: string | null): UseQueryResult<SubjectWithAssignments> {
    return useQuery({
        queryKey: subjectsKeys.detail(id ?? ""),
        queryFn: () => getSubjectById(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateSubject(): UseMutationResult<Subject, Error, CreateSubjectRequest> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSubject,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: subjectsKeys.lists() });
        },
    });
}

export function useUpdateSubject(): UseMutationResult<
    Subject,
    Error,
    { id: string; data: UpdateSubjectRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateSubject(id, data),
        onSuccess: (subject) => {
            void queryClient.invalidateQueries({ queryKey: subjectsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: subjectsKeys.detail(subject.id) });
        },
    });
}

export function useDeleteSubject(): UseMutationResult<void, Error, { id: string }> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }) => deleteSubject(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: subjectsKeys.lists() });
        },
    });
}
