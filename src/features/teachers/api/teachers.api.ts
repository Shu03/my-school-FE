import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AssignPresetRequest,
    CreateAssignmentRequest,
    CreatePresetRequest,
    PermissionPreset,
    ReplaceOverridesRequest,
    TeacherAssignment,
    TeacherProfile,
    UpdatePresetRequest,
    UpdateTeacherRequest,
} from "../types/teacher.types";

export async function listPresets(): Promise<PermissionPreset[]> {
    return apiFetch<PermissionPreset[]>(API_ENDPOINTS.TEACHERS.PRESETS, { method: "GET" });
}

export async function createPreset(data: CreatePresetRequest): Promise<PermissionPreset> {
    return apiFetch<PermissionPreset>(API_ENDPOINTS.TEACHERS.PRESETS, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updatePreset(
    presetId: string,
    data: UpdatePresetRequest,
): Promise<PermissionPreset> {
    return apiFetch<PermissionPreset>(API_ENDPOINTS.TEACHERS.presetById(presetId), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deletePreset(presetId: string): Promise<void> {
    await apiFetch<void>(API_ENDPOINTS.TEACHERS.presetById(presetId), { method: "DELETE" });
}

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

export async function assignPreset(id: string, data: AssignPresetRequest): Promise<TeacherProfile> {
    return apiFetch<TeacherProfile>(API_ENDPOINTS.TEACHERS.assignPreset(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function removePreset(id: string): Promise<TeacherProfile> {
    return apiFetch<TeacherProfile>(API_ENDPOINTS.TEACHERS.removePreset(id), { method: "PATCH" });
}

export async function replaceOverrides(
    id: string,
    data: ReplaceOverridesRequest,
): Promise<TeacherProfile> {
    return apiFetch<TeacherProfile>(API_ENDPOINTS.TEACHERS.permissions(id), {
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
