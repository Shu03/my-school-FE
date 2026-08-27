export interface HomeworkClass {
    id: string;
    name: string;
    gradeLevel: number;
}

export interface HomeworkSubject {
    id: string;
    name: string;
    code: string;
}

export interface HomeworkCreatorUser {
    firstName: string;
    lastName: string;
}

export interface HomeworkCreator {
    id: string;
    userId: string;
    employeeCode: string;
    user: HomeworkCreatorUser;
}

export interface Homework {
    id: string;
    title: string;
    description: string;
    classId: string;
    subjectId: string;
    academicYearId: string;
    dueDate: string;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
    class: HomeworkClass;
    subject: HomeworkSubject;
    createdBy: HomeworkCreator | null;
}

export interface HomeworkListParams {
    classId?: string;
    subjectId?: string;
    academicYearId?: string;
}

export interface CreateHomeworkRequest {
    title: string;
    description: string;
    classId: string;
    subjectId: string;
    academicYearId?: string;
    dueDate: string;
}

export interface UpdateHomeworkRequest {
    title?: string;
    description?: string;
    dueDate?: string;
}
