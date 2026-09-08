export interface Subject {
    id: string;
    name: string;
    code: string;
    classLevel: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export type TeacherAssignmentRole = "CLASS_TEACHER" | "SUBJECT_TEACHER";

export interface SubjectAssignment {
    id: string;
    teacherId: string;
    sectionId: string;
    subjectId: string | null;
    role: TeacherAssignmentRole;
    createdAt: string;
    section: {
        id: string;
        name: string;
        classLevel: number;
    };
    teacher: {
        id: string;
        employeeCode: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    };
}

export interface SubjectWithAssignments extends Subject {
    teacherAssignments: SubjectAssignment[];
}

export interface SubjectsListParams {
    classLevel?: number;
    search?: string;
}

export interface CreateSubjectRequest {
    name: string;
    code: string;
    classLevel: number;
    description?: string;
}

export interface UpdateSubjectRequest {
    name?: string;
    code?: string;
    description?: string;
}
