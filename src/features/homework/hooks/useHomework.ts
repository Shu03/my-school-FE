import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    createHomework,
    deleteHomework,
    getHomeworkById,
    listHomework,
    updateHomework,
} from "../api/homework.api";
import type {
    CreateHomeworkRequest,
    Homework,
    HomeworkListParams,
    UpdateHomeworkRequest,
} from "../types/homework.types";

/** Query-key factory for the homework feature. */
export const homeworkKeys = {
    all: ["homework"] as const,
    lists: () => [...homeworkKeys.all, "list"] as const,
    list: (params: HomeworkListParams) => [...homeworkKeys.lists(), params] as const,
    details: () => [...homeworkKeys.all, "detail"] as const,
    detail: (id: string) => [...homeworkKeys.details(), id] as const,
};

export function useHomeworkList(params: HomeworkListParams): UseQueryResult<Homework[]> {
    return useQuery({
        queryKey: homeworkKeys.list(params),
        queryFn: () => listHomework(params),
    });
}

export function useHomework(id: string | null): UseQueryResult<Homework> {
    return useQuery({
        queryKey: homeworkKeys.detail(id ?? ""),
        queryFn: () => getHomeworkById(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateHomework(): UseMutationResult<Homework, Error, CreateHomeworkRequest> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createHomework,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: homeworkKeys.lists() });
        },
    });
}

export function useUpdateHomework(): UseMutationResult<
    Homework,
    Error,
    { id: string; data: UpdateHomeworkRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateHomework(id, data),
        onSuccess: (homework) => {
            void queryClient.invalidateQueries({ queryKey: homeworkKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: homeworkKeys.detail(homework.id) });
        },
    });
}

export function useDeleteHomework(): UseMutationResult<void, Error, { id: string }> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }) => deleteHomework(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: homeworkKeys.lists() });
        },
    });
}
