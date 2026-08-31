import type { FeeStatus } from "@constants/fees.constants";

import type { Role } from "@/types/api";

export interface FeeAcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FeeStructure {
    id: string;
    gradeLevel: number;
    academicYearId: string;
    totalAmount: number;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    academicYear: FeeAcademicYear;
}

export interface FeeStudentUser {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string | null;
    role: Role;
    isActive: boolean;
}

export interface FeeStudent {
    id: string;
    userId: string;
    admissionNumber: string;
    dateOfBirth: string;
    createdAt: string;
    updatedAt: string;
    user: FeeStudentUser;
}

export interface FeeRecordStructure {
    id: string;
    gradeLevel: number;
    academicYearId: string;
    totalAmount: number;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface FeeRecord {
    id: string;
    studentId: string;
    academicYearId: string;
    feeStructureId: string;
    totalAmount: number;
    status: FeeStatus;
    amountPaid: number;
    createdAt: string;
    updatedAt: string;
    student: FeeStudent;
    feeStructure: FeeRecordStructure;
}

export interface FeePaymentRecordedBy {
    id: string;
    firstName: string;
    lastName: string;
}

export interface FeePayment {
    id: string;
    feeRecordId: string;
    amount: number;
    paidOn: string;
    note: string | null;
    recordedById: string | null;
    createdAt: string;
    recordedBy: FeePaymentRecordedBy | null;
}

export interface FeeRecordWithPayments extends FeeRecord {
    payments: FeePayment[];
}

export interface BackfillResult {
    created: number;
    skipped: number;
}

export interface FeeStructuresListParams {
    academicYearId?: string;
}

export interface FeeRecordsListParams {
    classId?: string;
    academicYearId?: string;
    status?: FeeStatus;
}

export interface CreateFeeStructureRequest {
    gradeLevel: number;
    academicYearId?: string;
    totalAmount: number;
    dueDate: string;
}

export interface UpdateFeeStructureRequest {
    totalAmount?: number;
    dueDate?: string;
}

export interface BackfillRequest {
    academicYearId?: string;
}

export interface RecordPaymentRequest {
    amount: number;
    paidOn: string;
    note?: string;
}
