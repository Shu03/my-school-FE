import type {
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    LoginSuccessResponse,
    User,
} from "@/types";

import apiClient from "./client";

export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
}

export async function refreshToken(token: string): Promise<LoginSuccessResponse> {
    const response = await apiClient.post<LoginSuccessResponse>("/auth/refresh", {
        refreshToken: token,
    });
    return response.data;
}

export async function logout(): Promise<void> {
    await apiClient.post("/auth/logout");
}

export async function changePassword(
    data: ChangePasswordRequest,
    firstLoginToken?: string,
): Promise<LoginSuccessResponse> {
    const headers: Record<string, string> = {};
    if (firstLoginToken) {
        headers.Authorization = `Bearer ${firstLoginToken}`;
    }
    const response = await apiClient.post<LoginSuccessResponse>("/auth/change-password", data, {
        headers,
    });
    return response.data;
}

export async function resetPassword(userId: string): Promise<void> {
    await apiClient.post("/auth/admin/reset-password", { userId });
}

export async function getMe(): Promise<User> {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
}
