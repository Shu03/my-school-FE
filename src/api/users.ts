import type {
    CreateAdminRequest,
    CreateStudentRequest,
    CreateTeacherRequest,
    PaginatedResponse,
    UpdateUserRequest,
    UserDetail,
    UserListParams,
} from "@/types";

import apiClient from "./client";

export async function getUsers(params: UserListParams): Promise<PaginatedResponse<UserDetail>> {
    const response = await apiClient.get<PaginatedResponse<UserDetail>>("/users", { params });
    return response.data;
}

export async function getUserById(id: string): Promise<UserDetail> {
    const response = await apiClient.get<UserDetail>(`/users/${id}`);
    return response.data;
}

export async function createAdmin(data: CreateAdminRequest): Promise<UserDetail> {
    const response = await apiClient.post<UserDetail>("/users/admin", data);
    return response.data;
}

export async function createTeacher(data: CreateTeacherRequest): Promise<UserDetail> {
    const response = await apiClient.post<UserDetail>("/users/teacher", data);
    return response.data;
}

export async function createStudent(data: CreateStudentRequest): Promise<UserDetail> {
    const response = await apiClient.post<UserDetail>("/users/student", data);
    return response.data;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserDetail> {
    const response = await apiClient.patch<UserDetail>(`/users/${id}`, data);
    return response.data;
}

export async function activateUser(id: string): Promise<UserDetail> {
    const response = await apiClient.patch<UserDetail>(`/users/${id}/activate`);
    return response.data;
}

export async function deactivateUser(id: string): Promise<UserDetail> {
    const response = await apiClient.patch<UserDetail>(`/users/${id}/deactivate`);
    return response.data;
}
