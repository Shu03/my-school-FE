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

/** The subject entity attached to an exam-subject row. */
export interface ExamSubjectDetail {
    id: string;
    name: string;
    code: string;
    gradeLevel: number;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

/** A subject scheduled within an exam (the exam_subjects join row). */
export interface ExamSubject {
    id: string;
    examId: string;
    subjectId: string;
    totalMarks: number;
    date: string;
    createdAt: string;
    updatedAt: string;
    subject: ExamSubjectDetail;
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
    academicYearId: string;
    termId: string | null;
    isFinalized: boolean;
    status: ExamStatus;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
    class: ExamClass;
    academicYear: ExamAcademicYear;
    examSubjects: ExamSubject[];
}

export interface ExamSubjectSummary {
    examSubjectId: string;
    subjectId: string;
    subjectName: string;
    totalMarks: number;
    date: string;
    gradeCount: number;
    averageMarks: number | null;
}

export interface ExamWithSummary extends Exam {
    subjectSummaries: ExamSubjectSummary[];
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

export interface ExamSubjectInput {
    subjectId: string;
    totalMarks: number;
    date: string;
}

export interface CreateExamRequest {
    name: string;
    type: ExamType;
    classId: string;
    academicYearId?: string;
    termId?: string;
    subjects: ExamSubjectInput[];
}

export interface UpdateExamRequest {
    name?: string;
    type?: ExamType;
    termId?: string;
}

export interface AddExamSubjectRequest {
    subjectId: string;
    totalMarks: number;
    date: string;
}

export interface UpdateExamSubjectRequest {
    totalMarks?: number;
    date?: string;
}
