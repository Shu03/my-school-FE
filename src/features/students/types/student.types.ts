import type { EnrollmentStatus } from "@constants/students.constants";

/** Student user summary embedded in student profile responses. */
export interface StudentUserSummary {
    id: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email: string | null;
    role: "STUDENT";
    isActive: boolean;
    isFirstLogin: boolean;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
}

/** Student profile as returned by GET /students and GET /students/:id. */
export interface StudentProfile {
    id: string;
    userId: string;
    admissionNumber: string;
    dateOfBirth: string | null;
    createdAt: string;
    updatedAt: string;
    user: StudentUserSummary;
}

/** Class summary nested inside an enrollment record. */
export interface EnrollmentClass {
    id: string;
    name: string;
    gradeLevel: number;
    academicYearId: string;
    classTeacherId: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Academic-year summary nested inside an enrollment record. */
export interface EnrollmentAcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
}

/** A single class enrollment for a student in one academic year. */
export interface StudentEnrollment {
    id: string;
    studentId: string;
    classId: string;
    academicYearId: string;
    rollNumber: string;
    status: EnrollmentStatus;
    createdAt: string;
    updatedAt: string;
    class: EnrollmentClass;
    academicYear: EnrollmentAcademicYear;
}

/** Student profile with its enrollment history, returned by GET /students/:id. */
export interface StudentProfileWithEnrollments extends StudentProfile {
    enrollments: StudentEnrollment[];
}

/** Filters and pagination for GET /students. */
export interface StudentsListParams {
    classId?: string;
    academicYearId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

/** Paginated list shape returned by GET /students (envelope already unwrapped). */
export interface StudentsListResponse {
    data: StudentProfile[];
    total: number;
    page: number;
    limit: number;
}

export interface UpdateStudentRequest {
    dateOfBirth?: string;
    admissionNumber?: string;
}

export interface EnrollStudentRequest {
    classId: string;
    academicYearId?: string;
    rollNumber?: string;
}

export interface UpdateEnrollmentRequest {
    status?: EnrollmentStatus;
    rollNumber?: string;
}

export interface PromoteStudentsRequest {
    studentIds: string[];
    targetClassId: string;
    academicYearId?: string;
}

export interface PromoteStudentsResponse {
    promoted: number;
    skipped: { studentId: string; reason: string }[];
}
