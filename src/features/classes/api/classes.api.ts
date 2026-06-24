import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AssignClassTeacherRequest,
    ClassesListParams,
    CreateClassRequest,
    SchoolClass,
    SchoolClassWithRelations,
    TeacherProfileSummary,
    UpdateClassRequest,
} from "../types/class.types";

export async function listClasses(params?: ClassesListParams): Promise<SchoolClass[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.CLASSES.BASE}?${queryString}`
        : API_ENDPOINTS.CLASSES.BASE;

    return apiFetch<SchoolClass[]>(endpoint, {
        method: "GET",
    });
}

export async function getClassById(id: string): Promise<SchoolClassWithRelations> {
    return apiFetch<SchoolClassWithRelations>(API_ENDPOINTS.CLASSES.byId(id), {
        method: "GET",
    });
}

export async function createClass(data: CreateClassRequest): Promise<SchoolClass> {
    return apiFetch<SchoolClass>(API_ENDPOINTS.CLASSES.BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateClass(id: string, data: UpdateClassRequest): Promise<SchoolClass> {
    return apiFetch<SchoolClass>(API_ENDPOINTS.CLASSES.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function assignClassTeacher(
    id: string,
    data: AssignClassTeacherRequest,
): Promise<SchoolClass> {
    return apiFetch<SchoolClass>(API_ENDPOINTS.CLASSES.assignTeacher(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function removeClassTeacher(id: string): Promise<SchoolClass> {
    return apiFetch<SchoolClass>(API_ENDPOINTS.CLASSES.removeTeacher(id), {
        method: "PATCH",
    });
}

export async function listTeacherProfiles(): Promise<TeacherProfileSummary[]> {
    return apiFetch<TeacherProfileSummary[]>(API_ENDPOINTS.TEACHERS.BASE, {
        method: "GET",
    });
}
