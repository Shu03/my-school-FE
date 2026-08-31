import type { ExamStatus, ExamType } from "@constants/exams.constants";

export interface ExamClass {
    id: string;
    name: string;
    gradeLevel: number;
    academicYearId: string;
    classTeacherId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamSubject {
    id: string;
    name: string;
    code: string;
    gradeLevel: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamAcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Exam {
    id: string;
    name: string;
    type: ExamType;
    classId: string;
    subjectId: string;
    academicYearId: string;
    termId: string | null;
    totalMarks: number;
    date: string;
    isFinalized: boolean;
    status: ExamStatus;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
    class: ExamClass;
    subject: ExamSubject;
    academicYear: ExamAcademicYear;
}

export interface ExamWithSummary extends Exam {
    gradeCount: number;
    averageMarks: number | null;
}

export interface ExamsListParams {
    classId?: string;
    subjectId?: string;
    academicYearId?: string;
    type?: ExamType;
    status?: ExamStatus;
    page?: number;
    limit?: number;
}

export interface ExamsListResponse {
    data: Exam[];
    total: number;
    page: number;
    limit: number;
}

export interface CreateExamRequest {
    name: string;
    type: ExamType;
    classId: string;
    subjectId: string;
    academicYearId?: string;
    termId?: string;
    totalMarks: number;
    date: string;
}

export interface UpdateExamRequest {
    name?: string;
    type?: ExamType;
    totalMarks?: number;
    date?: string;
    termId?: string;
}
