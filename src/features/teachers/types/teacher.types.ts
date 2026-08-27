import type { Permission } from "@constants/permissions.constants";

export type TeacherClassRole = "CLASS_TEACHER" | "SUBJECT_TEACHER";

export interface PermissionPreset {
    id: string;
    name: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

export interface TeacherUser {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
    role: "TEACHER";
    isActive: boolean;
}

export interface TeacherProfile {
    id: string;
    userId: string;
    employeeCode: string;
    joiningDate?: string;
    presetId?: string | null;
    permissionOverrides: Permission[];
    createdAt: string;
    updatedAt: string;
    user: TeacherUser;
    preset: PermissionPreset | null;
}

export interface TeacherAssignment {
    id: string;
    teacherId: string;
    classId: string;
    subjectId: string | null;
    role: TeacherClassRole;
    createdAt: string;
    class: {
        id: string;
        name: string;
        gradeLevel: number;
    };
    subject: {
        id: string;
        name: string;
        code: string;
        gradeLevel: number;
    } | null;
}

export interface CreatePresetRequest {
    name: string;
    permissions: Permission[];
}

export interface UpdatePresetRequest {
    name?: string;
    permissions?: Permission[];
}

export interface UpdateTeacherRequest {
    employeeCode?: string;
    joiningDate?: string;
}

export interface AssignPresetRequest {
    presetId: string;
}

export interface ReplaceOverridesRequest {
    permissionOverrides: Permission[];
}

export interface CreateAssignmentRequest {
    classId: string;
    role: TeacherClassRole;
    subjectId?: string;
}
