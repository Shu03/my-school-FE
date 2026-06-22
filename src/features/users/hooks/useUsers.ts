import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    activateUser,
    createAdmin,
    createStudent,
    createTeacher,
    deactivateUser,
    getUserById,
    getUsers,
    updateUser,
} from "../api/users.api";
import type {
    CreateAdminRequest,
    CreateStudentRequest,
    CreateTeacherRequest,
    CreateUserResult,
    UpdateUserRequest,
    User,
    UserListParams,
    UserListResponse,
    UserWithProfiles,
    UserWithStudentProfile,
    UserWithTeacherProfile,
} from "../types/user.types";

/** Query-key factory for the users feature. */
export const usersKeys = {
    all: ["users"] as const,
    lists: () => [...usersKeys.all, "list"] as const,
    list: (params: UserListParams) => [...usersKeys.lists(), params] as const,
    details: () => [...usersKeys.all, "detail"] as const,
    detail: (id: string) => [...usersKeys.details(), id] as const,
};

export function useUsersList(params: UserListParams): UseQueryResult<UserListResponse> {
    return useQuery({
        queryKey: usersKeys.list(params),
        queryFn: () => getUsers(params),
    });
}

export function useUser(id: string | null): UseQueryResult<UserWithProfiles> {
    return useQuery({
        queryKey: usersKeys.detail(id ?? ""),
        queryFn: () => getUserById(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateAdmin(): UseMutationResult<
    CreateUserResult<User>,
    Error,
    CreateAdminRequest
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAdmin,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
    });
}

export function useCreateTeacher(): UseMutationResult<
    CreateUserResult<UserWithTeacherProfile>,
    Error,
    CreateTeacherRequest
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTeacher,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
    });
}

export function useCreateStudent(): UseMutationResult<
    CreateUserResult<UserWithStudentProfile>,
    Error,
    CreateStudentRequest
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
    });
}

export function useUpdateUser(): UseMutationResult<
    User,
    Error,
    { id: string; data: UpdateUserRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateUser(id, data),
        onSuccess: (user) => {
            void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: usersKeys.detail(user.id) });
        },
    });
}

export function useActivateUser(): UseMutationResult<User, Error, string> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: activateUser,
        onSuccess: (user) => {
            void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: usersKeys.detail(user.id) });
        },
    });
}

export function useDeactivateUser(): UseMutationResult<User, Error, string> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deactivateUser,
        onSuccess: (user) => {
            void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: usersKeys.detail(user.id) });
        },
    });
}
