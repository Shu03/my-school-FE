import type {
    CreateAdminRequest,
    CreateStudentRequest,
    CreateTeacherRequest,
    PaginatedResponse,
    UpdateUserRequest,
    UserDetail,
    UserListParams,
} from "@/types";

import apiFetch from "./client";

export async function getUsers(params: UserListParams): Promise<PaginatedResponse<UserDetail>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";
    return apiFetch<PaginatedResponse<UserDetail>>(endpoint, {
        method: "GET",
    });
}

export async function getUserById(id: string): Promise<UserDetail> {
    return apiFetch<UserDetail>(`/users/${id}`, {
        method: "GET",
    });
}

export async function createAdmin(data: CreateAdminRequest): Promise<UserDetail> {
    return apiFetch<UserDetail>("/users/admin", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function createTeacher(data: CreateTeacherRequest): Promise<UserDetail> {
    return apiFetch<UserDetail>("/users/teacher", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function createStudent(data: CreateStudentRequest): Promise<UserDetail> {
    return apiFetch<UserDetail>("/users/student", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserDetail> {
    return apiFetch<UserDetail>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function activateUser(id: string): Promise<UserDetail> {
    return apiFetch<UserDetail>(`/users/${id}/activate`, {
        method: "PATCH",
    });
}

export async function deactivateUser(id: string): Promise<UserDetail> {
    return apiFetch<UserDetail>(`/users/${id}/deactivate`, {
        method: "PATCH",
    });
}
