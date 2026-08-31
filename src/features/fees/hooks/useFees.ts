import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    backfillFees,
    createFeeStructure,
    getFeeRecord,
    getStudentFeeHistory,
    listFeeRecords,
    listFeeStructures,
    recordPayment,
    updateFeeStructure,
} from "../api/fees.api";
import type {
    BackfillRequest,
    BackfillResult,
    CreateFeeStructureRequest,
    FeePayment,
    FeeRecord,
    FeeRecordsListParams,
    FeeRecordWithPayments,
    FeeStructure,
    FeeStructuresListParams,
    RecordPaymentRequest,
    UpdateFeeStructureRequest,
} from "../types/fee.types";

/** Query-key factory for the fees feature. */
export const feesKeys = {
    all: ["fees"] as const,
    structures: () => [...feesKeys.all, "structures"] as const,
    structuresList: (params: FeeStructuresListParams) =>
        [...feesKeys.structures(), params] as const,
    records: () => [...feesKeys.all, "records"] as const,
    recordsList: (params: FeeRecordsListParams) => [...feesKeys.records(), params] as const,
    recordDetail: (id: string) => [...feesKeys.records(), "detail", id] as const,
    studentHistory: (studentId: string) => [...feesKeys.all, "student", studentId] as const,
};

export function useFeeStructuresList(
    params: FeeStructuresListParams,
    enabled = true,
): UseQueryResult<FeeStructure[]> {
    return useQuery({
        queryKey: feesKeys.structuresList(params),
        queryFn: () => listFeeStructures(params),
        enabled,
    });
}

export function useCreateFeeStructure(): UseMutationResult<
    FeeStructure,
    Error,
    CreateFeeStructureRequest
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFeeStructure,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: feesKeys.structures() });
        },
    });
}

export function useUpdateFeeStructure(): UseMutationResult<
    FeeStructure,
    Error,
    { id: string; data: UpdateFeeStructureRequest }
> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updateFeeStructure(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: feesKeys.structures() });
        },
    });
}

export function useBackfillFees(): UseMutationResult<BackfillResult, Error, BackfillRequest> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: backfillFees,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: feesKeys.records() });
        },
    });
}

export function useFeeRecordsList(
    params: FeeRecordsListParams,
    enabled = true,
): UseQueryResult<FeeRecord[]> {
    return useQuery({
        queryKey: feesKeys.recordsList(params),
        queryFn: () => listFeeRecords(params),
        enabled,
    });
}

export function useFeeRecord(id: string | null): UseQueryResult<FeeRecordWithPayments> {
    return useQuery({
        queryKey: feesKeys.recordDetail(id ?? ""),
        queryFn: () => getFeeRecord(id as string),
        enabled: Boolean(id),
    });
}

export function useRecordPayment(
    recordId: string,
): UseMutationResult<FeePayment, Error, RecordPaymentRequest> {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => recordPayment(recordId, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: feesKeys.recordDetail(recordId) });
            void queryClient.invalidateQueries({ queryKey: feesKeys.records() });
        },
    });
}

export function useStudentFeeHistory(studentId: string | null): UseQueryResult<FeeRecord[]> {
    return useQuery({
        queryKey: feesKeys.studentHistory(studentId ?? ""),
        queryFn: () => getStudentFeeHistory(studentId as string),
        enabled: Boolean(studentId),
    });
}
