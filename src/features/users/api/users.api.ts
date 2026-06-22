import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

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

export async function getUsers(params: UserListParams): Promise<UserListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.USERS.BASE}?${queryString}`
        : API_ENDPOINTS.USERS.BASE;
    return apiFetch<UserListResponse>(endpoint, {
        method: "GET",
    });
}

export async function getUserById(id: string): Promise<UserWithProfiles> {
    return apiFetch<UserWithProfiles>(API_ENDPOINTS.USERS.byId(id), {
        method: "GET",
    });
}

export async function createAdmin(data: CreateAdminRequest): Promise<CreateUserResult<User>> {
    return apiFetch<CreateUserResult<User>>(API_ENDPOINTS.USERS.ADMIN, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function createTeacher(
    data: CreateTeacherRequest,
): Promise<CreateUserResult<UserWithTeacherProfile>> {
    return apiFetch<CreateUserResult<UserWithTeacherProfile>>(API_ENDPOINTS.USERS.TEACHER, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function createStudent(
    data: CreateStudentRequest,
): Promise<CreateUserResult<UserWithStudentProfile>> {
    return apiFetch<CreateUserResult<UserWithStudentProfile>>(API_ENDPOINTS.USERS.STUDENT, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return apiFetch<User>(API_ENDPOINTS.USERS.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function activateUser(id: string): Promise<User> {
    return apiFetch<User>(API_ENDPOINTS.USERS.activate(id), {
        method: "PATCH",
    });
}

export async function deactivateUser(id: string): Promise<User> {
    return apiFetch<User>(API_ENDPOINTS.USERS.deactivate(id), {
        method: "PATCH",
    });
}
