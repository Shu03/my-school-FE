import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import { useAuthStore } from "@features/auth";
import { useTeacherAssignments, type TeacherAssignment } from "@features/teachers";

import {
    approveAccessRequest,
    cancelAccessRequest,
    createAccessRequest,
    getSubjectAccessTracking,
    grantAccess,
    listAccessRequests,
    listMyAccessRequests,
    rejectAccessRequest,
    revokeAccessRequest,
} from "../api/request-access.api";
import type {
    AccessRequest,
    AccessRequestFilters,
    AccessReviewRequest,
    CreateAccessRequest,
    GrantAccessRequest,
    Paginated,
    SubjectAccessTracking,
} from "../types/request-access.types";

export const requestAccessKeys = {
    all: ["request-access"] as const,
    mine: (filters: AccessRequestFilters) => [...requestAccessKeys.all, "mine", filters] as const,
    approved: (userId: string) => [...requestAccessKeys.all, "approved", userId] as const,
    list: (filters: AccessRequestFilters) => [...requestAccessKeys.all, "list", filters] as const,
    tracking: (sectionId: string, subjectId: string) =>
        [...requestAccessKeys.all, "tracking", sectionId, subjectId] as const,
};

export function useMyAccessRequests(
    filters: AccessRequestFilters = {},
): UseQueryResult<Paginated<AccessRequest>> {
    return useQuery({
        queryKey: requestAccessKeys.mine(filters),
        queryFn: () => listMyAccessRequests(filters),
    });
}

export function useApprovedAccessRequests(): UseQueryResult<Paginated<AccessRequest>> {
    const userId = useAuthStore((state) => state.user?.id);
    const role = useAuthStore((state) => state.user?.role);
    return useQuery({
        queryKey: requestAccessKeys.approved(userId ?? ""),
        queryFn: () => listMyAccessRequests({ status: "APPROVED", page: 1, limit: 100 }),
        enabled: Boolean(userId) && role === "TEACHER",
    });
}

export function useAccessRequests(
    filters: AccessRequestFilters = {},
): UseQueryResult<Paginated<AccessRequest>> {
    return useQuery({
        queryKey: requestAccessKeys.list(filters),
        queryFn: () => listAccessRequests(filters),
    });
}

export function useSubjectAccessTracking(
    sectionId: string,
    subjectId: string,
): UseQueryResult<SubjectAccessTracking> {
    return useQuery({
        queryKey: requestAccessKeys.tracking(sectionId, subjectId),
        queryFn: () => getSubjectAccessTracking(sectionId, subjectId),
        enabled: Boolean(sectionId && subjectId),
    });
}

function useInvalidateAccessData(): () => void {
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: requestAccessKeys.all });
    };
}

export function useCreateAccessRequest(): UseMutationResult<
    AccessRequest,
    Error,
    CreateAccessRequest
> {
    const invalidate = useInvalidateAccessData();
    return useMutation({
        mutationFn: (data: CreateAccessRequest) => createAccessRequest(data),
        onSuccess: invalidate,
    });
}

export function useCancelAccessRequest(): UseMutationResult<AccessRequest, Error, string> {
    const invalidate = useInvalidateAccessData();
    return useMutation({ mutationFn: cancelAccessRequest, onSuccess: invalidate });
}

export function useApproveAccessRequest(): UseMutationResult<
    AccessRequest,
    Error,
    { id: string; data: AccessReviewRequest }
> {
    const invalidate = useInvalidateAccessData();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AccessReviewRequest }) =>
            approveAccessRequest(id, data),
        onSuccess: invalidate,
    });
}

export function useRejectAccessRequest(): UseMutationResult<
    AccessRequest,
    Error,
    { id: string; data: Required<AccessReviewRequest> }
> {
    const invalidate = useInvalidateAccessData();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Required<AccessReviewRequest> }) =>
            rejectAccessRequest(id, data),
        onSuccess: invalidate,
    });
}

export function useRevokeAccessRequest(): UseMutationResult<
    AccessRequest,
    Error,
    { id: string; data: AccessReviewRequest }
> {
    const invalidate = useInvalidateAccessData();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AccessReviewRequest }) =>
            revokeAccessRequest(id, data),
        onSuccess: invalidate,
    });
}

export function useGrantAccess(): UseMutationResult<AccessRequest, Error, GrantAccessRequest> {
    const invalidate = useInvalidateAccessData();
    return useMutation({
        mutationFn: (data: GrantAccessRequest) => grantAccess(data),
        onSuccess: invalidate,
    });
}

export function useTeacherAccess(): {
    assignments: TeacherAssignment[];
    approvedRequests: AccessRequest[];
    isLoading: boolean;
} {
    const teacherProfileId = useAuthStore((state) => state.user?.teacherProfileId);
    const { data: assignments = [], isLoading: assignmentsLoading } = useTeacherAssignments(
        teacherProfileId ?? null,
    );
    const { data: approvedRequests, isLoading: requestsLoading } = useApprovedAccessRequests();
    return {
        assignments,
        approvedRequests: approvedRequests?.data ?? [],
        isLoading: assignmentsLoading || requestsLoading,
    };
}

export function hasSectionAssignment(assignments: TeacherAssignment[], sectionId: string): boolean {
    return assignments.some((assignment) => assignment.sectionId === sectionId);
}

export function isClassTeacherForSection(
    assignments: TeacherAssignment[],
    sectionId: string,
): boolean {
    return assignments.some(
        (assignment) => assignment.sectionId === sectionId && assignment.role === "CLASS_TEACHER",
    );
}

export function isSubjectTeacherFor(
    assignments: TeacherAssignment[],
    sectionId: string,
    subjectId: string,
): boolean {
    return assignments.some(
        (assignment) =>
            assignment.sectionId === sectionId &&
            assignment.subjectId === subjectId &&
            assignment.role === "SUBJECT_TEACHER",
    );
}

export function hasApprovedAccess(
    requests: AccessRequest[],
    type: "HOMEWORK" | "MARKS",
    sectionId: string,
    subjectId: string,
): boolean {
    return requests.some(
        (request) =>
            request.status === "APPROVED" &&
            request.type === type &&
            request.sectionId === sectionId &&
            request.subjectId === subjectId,
    );
}
