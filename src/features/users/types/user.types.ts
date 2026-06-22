import type { Role } from "@/types/api";

/** Teacher-specific profile, present only on TEACHER users. */
export interface TeacherProfile {
    id: string;
    userId: string;
    employeeCode: string;
    joiningDate: string | null;
    presetId: string | null;
    permissionOverrides: string[];
    createdAt: string;
    updatedAt: string;
}

/** Student-specific profile, present only on STUDENT users. */
export interface StudentProfile {
    id: string;
    userId: string;
    admissionNumber: string;
    dateOfBirth: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Core user record returned by the API (never includes the password). */
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string | null;
    role: Role;
    isActive: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
    resetPasswordById: string | null;
    resetPasswordAt: string | null;
}

/** User with both optional profiles, as returned by GET /users/:id. */
export interface UserWithProfiles extends User {
    teacherProfile: TeacherProfile | null;
    studentProfile: StudentProfile | null;
}

/** User including the teacher profile, returned by POST /users/teacher. */
export interface UserWithTeacherProfile extends User {
    teacherProfile: TeacherProfile;
}

/** User including the student profile, returned by POST /users/student. */
export interface UserWithStudentProfile extends User {
    studentProfile: StudentProfile;
}

export interface CreateAdminRequest {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
}

export interface CreateTeacherRequest extends CreateAdminRequest {
    employeeCode: string;
    joiningDate?: string;
}

export interface CreateStudentRequest extends CreateAdminRequest {
    admissionNumber: string;
    dateOfBirth?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
}

/** Filters and pagination for GET /users. */
export interface UserListParams {
    role?: Role;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

/** Paginated list shape returned by GET /users (envelope already unwrapped). */
export interface UserListResponse {
    data: User[];
    total: number;
    page: number;
    limit: number;
}

/** Wrapper returned by all create endpoints, carrying the one-time temp password. */
export interface CreateUserResult<T extends User = User> {
    user: T;
    tempPassword: string;
}
