export interface SchoolClass {
    id: string;
    name: string;
    gradeLevel: number;
    academicYearId: string;
    classTeacherId: string | null;
    /** Enrollment stats — optional until the backend exposes them. */
    studentCount?: number;
    boysCount?: number;
    girlsCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface SchoolClassWithRelations extends SchoolClass {
    academicYear: {
        id: string;
        name: string;
        isCurrent: boolean;
    };
    classTeacher: {
        id: string;
        employeeCode: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            mobileNumber: string;
            email?: string;
        };
    } | null;
}

export interface ClassesListParams {
    academicYearId?: string;
    gradeLevel?: number;
}

export interface CreateClassRequest {
    name: string;
    gradeLevel: number;
    academicYearId?: string;
}

export interface UpdateClassRequest {
    name?: string;
    gradeLevel?: number;
}

export interface AssignClassTeacherRequest {
    teacherId: string;
}

export interface TeacherProfileSummary {
    id: string;
    employeeCode: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
    };
}

export interface TeacherOption {
    id: string;
    label: string;
}
