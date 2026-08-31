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
    data: BulkEnterGradesRequest,
): Promise<BulkGradeResult> {
    return apiFetch<BulkGradeResult>(API_ENDPOINTS.GRADES.examGrades(examId), {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getExamGrades(examId: string): Promise<Grade[]> {
    return apiFetch<Grade[]>(API_ENDPOINTS.GRADES.examGrades(examId), {
        method: "GET",
    });
}

export async function getExamSummary(examId: string): Promise<ExamGradesSummary> {
    return apiFetch<ExamGradesSummary>(API_ENDPOINTS.GRADES.examSummary(examId), {
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
