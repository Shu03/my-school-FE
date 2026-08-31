import type { ExamType } from "@constants/exams.constants";

export interface GradeStudentUser {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string | null;
    role: "STUDENT";
    isActive: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
}

export interface GradeStudent {
    id: string;
    userId: string;
    admissionNumber: string;
    dateOfBirth: string | null;
    createdAt: string;
    updatedAt: string;
    user: GradeStudentUser;
}

export interface Grade {
    id: string;
    examId: string;
    studentId: string;
    marksObtained: number;
    remarks: string | null;
    gradedById: string | null;
    createdAt: string;
    updatedAt: string;
    student: GradeStudent;
}

export interface GradeRecordInput {
    studentId: string;
    marksObtained: number;
    remarks?: string;
}

export interface BulkEnterGradesRequest {
    records: GradeRecordInput[];
}

export interface BulkGradeResult {
    entered: number;
    examId: string;
}

export interface ExamGradeStudentSummary {
    studentId: string;
    name: string;
    marksObtained: number;
    percentage: number;
}

export interface ExamGradesSummary {
    examId: string;
    examName: string;
    totalMarks: number;
    classAverage: number | null;
    highest: number | null;
    lowest: number | null;
    students: ExamGradeStudentSummary[];
}

export interface StudentGradeHistoryEntry {
    examId: string;
    examName: string;
    subjectName: string;
    type: ExamType;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    date: string;
}

export interface StudentGradeHistory {
    studentId: string;
    exams: StudentGradeHistoryEntry[];
}

export interface StudentGradesParams {
    academicYearId?: string;
    subjectId?: string;
}
