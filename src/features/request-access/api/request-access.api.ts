import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AccessRequest,
    AccessRequestFilters,
    AccessReviewRequest,
    CreateAccessRequest,
    GrantAccessRequest,
    Paginated,
    SubjectAccessTracking,
} from "../types/request-access.types";

function buildQuery(params: AccessRequestFilters): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") searchParams.set(key, String(value));
    });
    return searchParams.toString();
}

export function listMyAccessRequests(
    params: AccessRequestFilters = {},
): Promise<Paginated<AccessRequest>> {
    const query = buildQuery(params);
    return apiFetch(`${API_ENDPOINTS.REQUEST_ACCESS.MINE}${query ? `?${query}` : ""}`, {
        method: "GET",
    });
}

export function listAccessRequests(
    params: AccessRequestFilters = {},
): Promise<Paginated<AccessRequest>> {
    const query = buildQuery(params);
    return apiFetch(`${API_ENDPOINTS.REQUEST_ACCESS.BASE}${query ? `?${query}` : ""}`, {
        method: "GET",
    });
}

export function getAccessRequest(id: string): Promise<AccessRequest> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.byId(id), { method: "GET" });
}

export function createAccessRequest(data: CreateAccessRequest): Promise<AccessRequest> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function cancelAccessRequest(id: string): Promise<AccessRequest> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.cancel(id), { method: "PATCH" });
}

export function approveAccessRequest(
    id: string,
    data: AccessReviewRequest,
): Promise<AccessRequest> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.approve(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function rejectAccessRequest(
    id: string,
    data: Required<AccessReviewRequest>,
): Promise<AccessRequest> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.reject(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function revokeAccessRequest(
    id: string,
    data: AccessReviewRequest,
): Promise<AccessRequest> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.revoke(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export function grantAccess(data: GrantAccessRequest): Promise<AccessRequest> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.GRANTS, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function getSubjectAccessTracking(
    sectionId: string,
    subjectId: string,
): Promise<SubjectAccessTracking> {
    return apiFetch(API_ENDPOINTS.REQUEST_ACCESS.sectionSubject(sectionId, subjectId), {
        method: "GET",
    });
}