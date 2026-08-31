import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    BulkEnterGradesRequest,
    BulkGradeResult,
    ExamGradesSummary,
    Grade,
    StudentGradeHistory,
    StudentGradesParams,
} from "../types/grade.types";

export async function enterGrades(
    examId: string,
    subjectId: string,
    data: BulkEnterGradesRequest,
): Promise<BulkGradeResult> {
    return apiFetch<BulkGradeResult>(API_ENDPOINTS.GRADES.examSubjectGrades(examId, subjectId), {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getExamSubjectGrades(examId: string, subjectId: string): Promise<Grade[]> {
    return apiFetch<Grade[]>(API_ENDPOINTS.GRADES.examSubjectGrades(examId, subjectId), {
        method: "GET",
    });
}

export async function getExamSubjectSummary(
    examId: string,
    subjectId: string,
): Promise<ExamGradesSummary> {
    return apiFetch<ExamGradesSummary>(API_ENDPOINTS.GRADES.examSubjectSummary(examId, subjectId), {
        method: "GET",
    });
}

export async function getStudentGradeHistory(
    studentId: string,
    params: StudentGradesParams,
): Promise<StudentGradeHistory> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.GRADES.studentHistory(studentId)}?${queryString}`
        : API_ENDPOINTS.GRADES.studentHistory(studentId);

    return apiFetch<StudentGradeHistory>(endpoint, {
        method: "GET",
    });
}
