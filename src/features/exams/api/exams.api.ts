import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AddExamSubjectRequest,
    CreateExamRequest,
    Exam,
    ExamsListParams,
    ExamsListResponse,
    ExamSubject,
    ExamWithSummary,
    UpdateExamRequest,
    UpdateExamSubjectRequest,
} from "../types/exam.types";

export async function listExams(params: ExamsListParams): Promise<ExamsListResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.EXAMS.BASE}?${queryString}`
        : API_ENDPOINTS.EXAMS.BASE;

    return apiFetch<ExamsListResponse>(endpoint, {
        method: "GET",
    });
}

export async function getExamById(id: string): Promise<ExamWithSummary> {
    return apiFetch<ExamWithSummary>(API_ENDPOINTS.EXAMS.byId(id), {
        method: "GET",
    });
}

export async function createExam(data: CreateExamRequest): Promise<Exam> {
    return apiFetch<Exam>(API_ENDPOINTS.EXAMS.BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateExam(id: string, data: UpdateExamRequest): Promise<Exam> {
    return apiFetch<Exam>(API_ENDPOINTS.EXAMS.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function addExamSubject(
    examId: string,
    data: AddExamSubjectRequest,
): Promise<ExamSubject> {
    return apiFetch<ExamSubject>(API_ENDPOINTS.EXAMS.subjects(examId), {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateExamSubject(
    examId: string,
    subjectId: string,
    data: UpdateExamSubjectRequest,
): Promise<ExamSubject> {
    return apiFetch<ExamSubject>(API_ENDPOINTS.EXAMS.subjectById(examId, subjectId), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function removeExamSubject(examId: string, subjectId: string): Promise<void> {
    return apiFetch<void>(API_ENDPOINTS.EXAMS.subjectById(examId, subjectId), {
        method: "DELETE",
    });
}

export async function finalizeExam(id: string): Promise<Exam> {
    return apiFetch<Exam>(API_ENDPOINTS.EXAMS.finalize(id), {
        method: "POST",
    });
}

export async function unlockExam(id: string): Promise<Exam> {
    return apiFetch<Exam>(API_ENDPOINTS.EXAMS.unlock(id), {
        method: "POST",
    });
}

export async function discardExam(id: string): Promise<Exam> {
    return apiFetch<Exam>(API_ENDPOINTS.EXAMS.discard(id), {
        method: "POST",
    });
}
