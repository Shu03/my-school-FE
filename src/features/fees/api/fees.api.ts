import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

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

function buildQuery(params: Record<string, string | undefined>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value);
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

export async function listFeeStructures(params: FeeStructuresListParams): Promise<FeeStructure[]> {
    const query = buildQuery({ academicYearId: params.academicYearId });
    return apiFetch<FeeStructure[]>(`${API_ENDPOINTS.FEES.STRUCTURES}${query}`, {
        method: "GET",
    });
}

export async function createFeeStructure(data: CreateFeeStructureRequest): Promise<FeeStructure> {
    return apiFetch<FeeStructure>(API_ENDPOINTS.FEES.STRUCTURES, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateFeeStructure(
    id: string,
    data: UpdateFeeStructureRequest,
): Promise<FeeStructure> {
    return apiFetch<FeeStructure>(API_ENDPOINTS.FEES.structureById(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function backfillFees(data: BackfillRequest): Promise<BackfillResult> {
    return apiFetch<BackfillResult>(API_ENDPOINTS.FEES.BACKFILL, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function listFeeRecords(params: FeeRecordsListParams): Promise<FeeRecord[]> {
    const query = buildQuery({
        classId: params.classId,
        academicYearId: params.academicYearId,
        status: params.status,
    });
    return apiFetch<FeeRecord[]>(`${API_ENDPOINTS.FEES.RECORDS}${query}`, {
        method: "GET",
    });
}

export async function getFeeRecord(id: string): Promise<FeeRecordWithPayments> {
    return apiFetch<FeeRecordWithPayments>(API_ENDPOINTS.FEES.recordById(id), {
        method: "GET",
    });
}

export async function getRecordPayments(id: string): Promise<FeePayment[]> {
    return apiFetch<FeePayment[]>(API_ENDPOINTS.FEES.recordPayments(id), {
        method: "GET",
    });
}

export async function recordPayment(id: string, data: RecordPaymentRequest): Promise<FeePayment> {
    return apiFetch<FeePayment>(API_ENDPOINTS.FEES.recordPayments(id), {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getStudentFeeHistory(studentId: string): Promise<FeeRecord[]> {
    return apiFetch<FeeRecord[]>(API_ENDPOINTS.FEES.studentHistory(studentId), {
        method: "GET",
    });
}
