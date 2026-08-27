import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    EnrollStudentRequest,
    PromoteStudentsRequest,
    PromoteStudentsResponse,
    StudentEnrollment,
    StudentProfile,
    StudentProfileWithEnrollments,
    StudentsListParams,
    StudentsListResponse,
    UpdateEnrollmentRequest,
    UpdateStudentRequest,
} from "../types/student.types";

export async function listStudents(params: StudentsListParams): Promise<StudentsListResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString
        ? `${API_ENDPOINTS.STUDENTS.BASE}?${queryString}`
        : API_ENDPOINTS.STUDENTS.BASE;

    return apiFetch<StudentsListResponse>(endpoint, {
        method: "GET",
    });
}

export async function getStudentById(id: string): Promise<StudentProfileWithEnrollments> {
    return apiFetch<StudentProfileWithEnrollments>(API_ENDPOINTS.STUDENTS.byId(id), {
        method: "GET",
    });
}

export async function updateStudent(
    id: string,
    data: UpdateStudentRequest,
): Promise<StudentProfile> {
    return apiFetch<StudentProfile>(API_ENDPOINTS.STUDENTS.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function enrollStudent(
    id: string,
    data: EnrollStudentRequest,
): Promise<StudentEnrollment> {
    return apiFetch<StudentEnrollment>(API_ENDPOINTS.STUDENTS.enroll(id), {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function listEnrollments(id: string): Promise<StudentEnrollment[]> {
    return apiFetch<StudentEnrollment[]>(API_ENDPOINTS.STUDENTS.enrollments(id), {
        method: "GET",
    });
}

export async function updateEnrollment(
    id: string,
    enrollmentId: string,
    data: UpdateEnrollmentRequest,
): Promise<StudentEnrollment> {
    return apiFetch<StudentEnrollment>(API_ENDPOINTS.STUDENTS.enrollmentById(id, enrollmentId), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function promoteStudents(
    data: PromoteStudentsRequest,
): Promise<PromoteStudentsResponse> {
    return apiFetch<PromoteStudentsResponse>(API_ENDPOINTS.STUDENTS.PROMOTE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
