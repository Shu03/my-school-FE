import type { Role } from "@/types/api";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
}

export interface LoginRequest {
    mobileNumber: string;
    password: string;
}

export interface LoginSuccessResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface ForcePasswordChangeResponse {
    forcePasswordChange: true;
    firstLoginToken: string;
}

export type LoginResponse = LoginSuccessResponse | ForcePasswordChangeResponse;

export interface RefreshRequest {
    refreshToken: string;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword: string;
}

export interface ResetPasswordRequest {
    userId: string;
}

export function isForcePasswordChange(
    response: LoginResponse,
): response is ForcePasswordChangeResponse {
    return "forcePasswordChange" in response && response.forcePasswordChange === true;
}
