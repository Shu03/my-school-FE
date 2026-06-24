import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    assignClassTeacher,
    createClass,
    getClassById,
    listTeacherProfiles,
    listClasses,
    removeClassTeacher,
    updateClass,
} from "../api/classes.api";
import type {
    ClassesListParams,
    CreateClassRequest,
    SchoolClass,
    SchoolClassWithRelations,
    TeacherProfileSummary,
    UpdateClassRequest,
} from "../types/class.types";

export const classesKeys = {
    all: ["classes"] as const,
    lists: () => [...classesKeys.all, "list"] as const,
    list: (params: ClassesListParams) => [...classesKeys.lists(), params] as const,
    details: () => [...classesKeys.all, "detail"] as const,
    detail: (id: string) => [...classesKeys.details(), id] as const,
    teachers: () => [...classesKeys.all, "teachers"] as const,
};

export function useClassesList(
    params: ClassesListParams,
    enabled = true,
): UseQueryResult<SchoolClass[]> {
    return useQuery({
        queryKey: classesKeys.list(params),
        queryFn: () => listClasses(params),
        enabled,
    });
}

export function useClass(id: string | null): UseQueryResult<SchoolClassWithRelations> {
    return useQuery({
        queryKey: classesKeys.detail(id ?? ""),
        queryFn: () => getClassById(id as string),
        enabled: Boolean(id),
    });
}

export function useAssignableTeachers(): UseQueryResult<TeacherProfileSummary[]> {
    return useQuery({
        queryKey: classesKeys.teachers(),
        queryFn: listTeacherProfiles,
    });
}

export function useCreateClass(): UseMutationResult<SchoolClass, Error, CreateClassRequest> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createClass,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
        },
    });
}

export function useUpdateClass(): UseMutationResult<
    SchoolClass,
    Error,
    { id: string; data: UpdateClassRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateClass(id, data),
        onSuccess: (schoolClass) => {
            void queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: classesKeys.detail(schoolClass.id) });
        },
    });
}

export function useAssignClassTeacher(): UseMutationResult<
    SchoolClass,
    Error,
    { id: string; teacherId: string }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, teacherId }) => assignClassTeacher(id, { teacherId }),
        onSuccess: (schoolClass) => {
            void queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: classesKeys.detail(schoolClass.id) });
        },
    });
}

export function useRemoveClassTeacher(): UseMutationResult<SchoolClass, Error, { id: string }> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }) => removeClassTeacher(id),
        onSuccess: (schoolClass) => {
            void queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: classesKeys.detail(schoolClass.id) });
        },
    });
}
