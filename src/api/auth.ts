import type {
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    LoginSuccessResponse,
    User,
} from "@/types";

import apiFetch from "./client";

export async function login(data: LoginRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function refreshToken(token: string): Promise<LoginSuccessResponse> {
    return apiFetch<LoginSuccessResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: token }),
    });
}

export async function logout(): Promise<void> {
    await apiFetch("/auth/logout", {
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
    return apiFetch<LoginSuccessResponse>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
        headers,
    });
}

export async function resetPassword(userId: string): Promise<void> {
    await apiFetch("/auth/admin/reset-password", {
        method: "POST",
        body: JSON.stringify({ userId }),
    });
}

export async function getMe(): Promise<User> {
    return apiFetch<User>("/auth/me", {
        method: "GET",
    });
}
