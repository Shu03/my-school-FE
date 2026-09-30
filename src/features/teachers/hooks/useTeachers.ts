import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    createAssignment,
    deleteAssignment,
    getTeacherById,
    listAssignments,
    listTeachers,
    updateTeacher,
} from "../api/teachers.api";
import type {
    CreateAssignmentRequest,
    TeacherAssignment,
    TeacherProfile,
    UpdateTeacherRequest,
} from "../types/teacher.types";

export const teachersKeys = {
    all: ["teachers"] as const,
    lists: () => [...teachersKeys.all, "list"] as const,
    details: () => [...teachersKeys.all, "detail"] as const,
    detail: (id: string) => [...teachersKeys.details(), id] as const,
    assignments: (id: string) => [...teachersKeys.detail(id), "assignments"] as const,
};

export function useTeachersList(): UseQueryResult<TeacherProfile[]> {
    return useQuery({
        queryKey: teachersKeys.lists(),
        queryFn: listTeachers,
    });
}

export function useTeacher(id: string | null): UseQueryResult<TeacherProfile> {
    return useQuery({
        queryKey: teachersKeys.detail(id ?? ""),
        queryFn: () => getTeacherById(id as string),
        enabled: Boolean(id),
    });
}

export function useTeacherAssignments(id: string | null): UseQueryResult<TeacherAssignment[]> {
    return useQuery({
        queryKey: teachersKeys.assignments(id ?? ""),
        queryFn: () => listAssignments(id as string),
        enabled: Boolean(id),
    });
}

export function useUpdateTeacher(): UseMutationResult<
    TeacherProfile,
    Error,
    { id: string; data: UpdateTeacherRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateTeacher(id, data),
        onSuccess: (teacher) => {
            void queryClient.invalidateQueries({ queryKey: teachersKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: teachersKeys.detail(teacher.id) });
        },
    });
}

export function useCreateAssignment(): UseMutationResult<
    TeacherAssignment,
    Error,
    { id: string; data: CreateAssignmentRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => createAssignment(id, data),
        onSuccess: (assignment) => {
            void queryClient.invalidateQueries({
                queryKey: teachersKeys.assignments(assignment.teacherId),
            });
        },
    });
}

export function useDeleteAssignment(): UseMutationResult<
    void,
    Error,
    { id: string; assignmentId: string }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, assignmentId }) => deleteAssignment(id, assignmentId),
        onSuccess: (_result, { id }) => {
            void queryClient.invalidateQueries({ queryKey: teachersKeys.assignments(id) });
        },
    });
}
