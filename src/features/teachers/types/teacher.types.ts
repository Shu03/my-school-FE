export type TeacherClassRole = "CLASS_TEACHER" | "SUBJECT_TEACHER";

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
    createdAt: string;
    updatedAt: string;
    user: TeacherUser;
}

export interface TeacherAssignment {
    id: string;
    teacherId: string;
    sectionId: string;
    subjectId: string | null;
    role: TeacherClassRole;
    createdAt: string;
    section: {
        id: string;
        name: string;
        classLevel: number;
    };
    subject: {
        id: string;
        name: string;
        code: string;
        classLevel: number;
    } | null;
}

export interface UpdateTeacherRequest {
    employeeCode?: string;
    joiningDate?: string;
}

export interface CreateAssignmentRequest {
    sectionId: string;
    role: TeacherClassRole;
    subjectId?: string;
}
