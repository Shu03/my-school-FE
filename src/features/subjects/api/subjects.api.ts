import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    CreateSubjectRequest,
    Subject,
    SubjectWithAssignments,
    SubjectsListParams,
    UpdateSubjectRequest,
} from "../types/subject.types";

export async function listSubjects(params?: SubjectsListParams): Promise<Subject[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.SUBJECTS.BASE}?${queryString}`
        : API_ENDPOINTS.SUBJECTS.BASE;

    return apiFetch<Subject[]>(endpoint, {
        method: "GET",
    });
}

export async function getSubjectById(id: string): Promise<SubjectWithAssignments> {
    return apiFetch<SubjectWithAssignments>(API_ENDPOINTS.SUBJECTS.byId(id), {
        method: "GET",
    });
}

export async function createSubject(data: CreateSubjectRequest): Promise<Subject> {
    return apiFetch<Subject>(API_ENDPOINTS.SUBJECTS.BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSubject(id: string, data: UpdateSubjectRequest): Promise<Subject> {
    return apiFetch<Subject>(API_ENDPOINTS.SUBJECTS.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteSubject(id: string): Promise<void> {
    await apiFetch<void>(API_ENDPOINTS.SUBJECTS.byId(id), {
        method: "DELETE",
    });
}
