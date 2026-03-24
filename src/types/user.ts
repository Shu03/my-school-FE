import { Role } from "./api";

export interface UserDetail {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string | null;
    role: Role;
    isActive: boolean;
    employeeCode?: string;
    joiningDate?: string;
    admissionNumber?: string;
    dateOfBirth?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdminRequest {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
}

export interface CreateTeacherRequest {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
    employeeCode: string;
    joiningDate?: string;
}

export interface CreateStudentRequest {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
    admissionNumber: string;
    dateOfBirth?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface UserListParams {
    role?: Role;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
