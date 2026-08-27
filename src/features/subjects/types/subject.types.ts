export interface Subject {
    id: string;
    name: string;
    code: string;
    gradeLevel: number;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export type TeacherAssignmentRole = "CLASS_TEACHER" | "SUBJECT_TEACHER";

export interface SubjectAssignment {
    id: string;
    teacherId: string;
    classId: string;
    subjectId: string | null;
    role: TeacherAssignmentRole;
    createdAt: string;
    class: {
        id: string;
        name: string;
        gradeLevel: number;
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
    gradeLevel?: number;
    search?: string;
}

export interface CreateSubjectRequest {
    name: string;
    code: string;
    gradeLevel: number;
    description?: string;
}

export interface UpdateSubjectRequest {
    name?: string;
    code?: string;
    description?: string;
}
