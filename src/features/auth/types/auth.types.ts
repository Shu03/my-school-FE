import type { Role } from "@/types/api";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    permissions?: string[];
    isActive?: boolean;
    teacherProfileId?: string;
    studentProfileId?: string;
}

export interface MeResponse {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
    isFirstLogin: boolean;
    teacherProfile?: { id: string } | null;
    studentProfile?: { id: string } | null;
}

export interface ProfileTeacher {
    id: string;
    employeeCode: string;
    joiningDate: string | null;
    presetId: string | null;
    permissionOverrides: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ProfileStudent {
    id: string;
    admissionNumber: string;
    dateOfBirth: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Profile {
    id: string;
    mobileNumber: string;
    firstName: string;
    lastName: string;
    email: string | null;
    role: Role;
    isActive: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt: string;
    teacherProfile: ProfileTeacher | null;
    studentProfile: ProfileStudent | null;
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

export interface ResetPasswordResponse {
    tempPassword: string;
}

export function isForcePasswordChange(
    response: LoginResponse,
): response is ForcePasswordChangeResponse {
    return "forcePasswordChange" in response && response.forcePasswordChange === true;
}
