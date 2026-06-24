import { API_ENDPOINTS } from "@constants/apiEndpoints.constants";

import apiFetch from "@lib/api/client";

import type {
    AcademicYear,
    AcademicYearWithTerms,
    CreateAcademicYearRequest,
    CreateTermRequest,
    Term,
    UpdateAcademicYearRequest,
    UpdateTermRequest,
} from "../types/academic-year.types";

export async function listAcademicYears(): Promise<AcademicYear[]> {
    return apiFetch<AcademicYear[]>(API_ENDPOINTS.ACADEMIC_YEARS.BASE, {
        method: "GET",
    });
}

export async function getCurrentAcademicYear(): Promise<AcademicYearWithTerms> {
    return apiFetch<AcademicYearWithTerms>(API_ENDPOINTS.ACADEMIC_YEARS.CURRENT, {
        method: "GET",
    });
}

export async function getAcademicYearById(id: string): Promise<AcademicYearWithTerms> {
    return apiFetch<AcademicYearWithTerms>(API_ENDPOINTS.ACADEMIC_YEARS.byId(id), {
        method: "GET",
    });
}

export async function createAcademicYear(data: CreateAcademicYearRequest): Promise<AcademicYear> {
    return apiFetch<AcademicYear>(API_ENDPOINTS.ACADEMIC_YEARS.BASE, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateAcademicYear(
    id: string,
    data: UpdateAcademicYearRequest,
): Promise<AcademicYear> {
    return apiFetch<AcademicYear>(API_ENDPOINTS.ACADEMIC_YEARS.byId(id), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function setCurrentAcademicYear(id: string): Promise<AcademicYear> {
    return apiFetch<AcademicYear>(API_ENDPOINTS.ACADEMIC_YEARS.setCurrent(id), {
        method: "PATCH",
    });
}

export async function listTermsByAcademicYear(id: string): Promise<Term[]> {
    return apiFetch<Term[]>(API_ENDPOINTS.ACADEMIC_YEARS.terms(id), {
        method: "GET",
    });
}

export async function createTerm(id: string, data: CreateTermRequest): Promise<Term> {
    return apiFetch<Term>(API_ENDPOINTS.ACADEMIC_YEARS.terms(id), {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateTerm(
    id: string,
    termId: string,
    data: UpdateTermRequest,
): Promise<Term> {
    return apiFetch<Term>(API_ENDPOINTS.ACADEMIC_YEARS.termById(id, termId), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteTerm(id: string, termId: string): Promise<void> {
    await apiFetch(API_ENDPOINTS.ACADEMIC_YEARS.termById(id, termId), {
        method: "DELETE",
    });
}
