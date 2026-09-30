import type { Role } from "@/types/api";

export type AccessType = "HOMEWORK" | "MARKS";

export type AccessRequestStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "REVOKED";

export interface UserSummary {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    role: Role;
}

export interface AccessSection {
    id: string;
    name: string;
    classLevel: number;
    academicYearId: string;
    createdAt: string;
    updatedAt: string;
}

export interface AccessSubject {
    id: string;
    name: string;
    code: string;
    classLevel: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface AccessRequest {
    id: string;
    requesterId: string;
    type: AccessType;
    status: AccessRequestStatus;
    sectionId: string | null;
    subjectId: string | null;
    reason: string | null;
    requestedById: string;
    reviewedById: string | null;
    reviewedAt: string | null;
    reviewRemarks: string | null;
    revokedById: string | null;
    revokedAt: string | null;
    revokeRemarks: string | null;
    createdAt: string;
    updatedAt: string;
    requester: UserSummary;
    requestedBy: UserSummary;
    reviewedBy: UserSummary | null;
    revokedBy: UserSummary | null;
    section: AccessSection | null;
    subject: AccessSubject | null;
}

export interface Paginated<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface AccessRequestFilters {
    status?: AccessRequestStatus;
    type?: AccessType;
    requesterId?: string;
    sectionId?: string;
    subjectId?: string;
    page?: number;
    limit?: number;
}

export interface CreateAccessRequest {
    type: AccessType;
    sectionId: string;
    subjectId: string;
    reason: string;
}

export interface AccessReviewRequest {
    remarks?: string;
}

export interface GrantAccessRequest {
    requesterId: string;
    type: AccessType;
    sectionId: string;
    subjectId: string;
    remarks?: string;
}

export interface TeacherWithUser {
    id: string;
    userId: string;
    employeeCode: string;
    joiningDate: string | null;
    createdAt: string;
    updatedAt: string;
    user: UserSummary;
}

export interface SubjectAccessTracking {
    section: AccessSection;
    subject: AccessSubject;
    classTeacher: TeacherWithUser | null;
    subjectTeachers: TeacherWithUser[];
    grantedAccess: AccessRequest[];
}