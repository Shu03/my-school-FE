import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    LoginSuccessResponse,
    User,
} from "../types/auth.types";

export async function login(data: LoginRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function refreshToken(token: string): Promise<LoginSuccessResponse> {
    return apiFetch<LoginSuccessResponse>(API_ENDPOINTS.AUTH.REFRESH, {
        method: "POST",
        body: JSON.stringify({ refreshToken: token }),
    });
}

export async function logout(): Promise<void> {
    await apiFetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
    });
}

export async function changePassword(
    data: ChangePasswordRequest,
    firstLoginToken?: string,
): Promise<LoginSuccessResponse> {
    const headers: Record<string, string> = {};
    if (firstLoginToken) {
        headers.Authorization = `Bearer ${firstLoginToken}`;
    }
    return apiFetch<LoginSuccessResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: "POST",
        body: JSON.stringify(data),
        headers,
    });
}

export async function resetPassword(userId: string): Promise<void> {
    await apiFetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: "POST",
        body: JSON.stringify({ userId }),
    });
}

export async function getMe(): Promise<User> {
    return apiFetch<User>(API_ENDPOINTS.AUTH.ME, {
        method: "GET",
    });
}
