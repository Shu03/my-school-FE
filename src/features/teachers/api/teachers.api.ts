import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    CreateAssignmentRequest,
    TeacherAssignment,
    TeacherProfile,
    UpdateTeacherRequest,
} from "../types/teacher.types";

export async function listTeachers(): Promise<TeacherProfile[]> {
    return apiFetch<TeacherProfile[]>(API_ENDPOINTS.TEACHERS.BASE, { method: "GET" });
}

export async function getTeacherById(id: string): Promise<TeacherProfile> {
    return apiFetch<TeacherProfile>(API_ENDPOINTS.TEACHERS.byId(id), { method: "GET" });
}

export async function updateTeacher(
    id: string,
    data: UpdateTeacherRequest,
): Promise<TeacherProfile> {
    return apiFetch<TeacherProfile>(API_ENDPOINTS.TEACHERS.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function listAssignments(id: string): Promise<TeacherAssignment[]> {
    return apiFetch<TeacherAssignment[]>(API_ENDPOINTS.TEACHERS.assignments(id), { method: "GET" });
}

export async function createAssignment(
    id: string,
    data: CreateAssignmentRequest,
): Promise<TeacherAssignment> {
    return apiFetch<TeacherAssignment>(API_ENDPOINTS.TEACHERS.assignments(id), {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteAssignment(id: string, assignmentId: string): Promise<void> {
    await apiFetch<void>(API_ENDPOINTS.TEACHERS.assignmentById(id, assignmentId), {
        method: "DELETE",
    });
}
