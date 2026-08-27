import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    assignPreset,
    createAssignment,
    createPreset,
    deleteAssignment,
    deletePreset,
    getTeacherById,
    listAssignments,
    listPresets,
    listTeachers,
    removePreset,
    replaceOverrides,
    updatePreset,
    updateTeacher,
} from "../api/teachers.api";
import type {
    CreateAssignmentRequest,
    CreatePresetRequest,
    PermissionPreset,
    ReplaceOverridesRequest,
    TeacherAssignment,
    TeacherProfile,
    UpdatePresetRequest,
    UpdateTeacherRequest,
} from "../types/teacher.types";

export const teachersKeys = {
    all: ["teachers"] as const,
    lists: () => [...teachersKeys.all, "list"] as const,
    details: () => [...teachersKeys.all, "detail"] as const,
    detail: (id: string) => [...teachersKeys.details(), id] as const,
    assignments: (id: string) => [...teachersKeys.detail(id), "assignments"] as const,
    presets: () => [...teachersKeys.all, "presets"] as const,
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

export function usePresetsList(enabled = true): UseQueryResult<PermissionPreset[]> {
    return useQuery({
        queryKey: teachersKeys.presets(),
        queryFn: listPresets,
        enabled,
    });
}

export function useCreatePreset(): UseMutationResult<PermissionPreset, Error, CreatePresetRequest> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPreset,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: teachersKeys.presets() });
        },
    });
}

export function useUpdatePreset(): UseMutationResult<
    PermissionPreset,
    Error,
    { presetId: string; data: UpdatePresetRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ presetId, data }) => updatePreset(presetId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: teachersKeys.presets() });
        },
    });
}

export function useDeletePreset(): UseMutationResult<void, Error, { presetId: string }> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ presetId }) => deletePreset(presetId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: teachersKeys.presets() });
        },
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

export function useAssignPreset(): UseMutationResult<
    TeacherProfile,
    Error,
    { id: string; presetId: string }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, presetId }) => assignPreset(id, { presetId }),
        onSuccess: (teacher) => {
            void queryClient.invalidateQueries({ queryKey: teachersKeys.detail(teacher.id) });
        },
    });
}

export function useRemovePreset(): UseMutationResult<TeacherProfile, Error, { id: string }> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }) => removePreset(id),
        onSuccess: (teacher) => {
            void queryClient.invalidateQueries({ queryKey: teachersKeys.detail(teacher.id) });
        },
    });
}

export function useReplaceOverrides(): UseMutationResult<
    TeacherProfile,
    Error,
    { id: string; data: ReplaceOverridesRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => replaceOverrides(id, data),
        onSuccess: (teacher) => {
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
