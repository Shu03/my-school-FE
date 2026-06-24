export interface Term {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    academicYearId: string;
    createdAt: string;
    updatedAt: string;
}

export interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AcademicYearWithTerms extends AcademicYear {
    terms: Term[];
}

export interface CreateAcademicYearRequest {
    name: string;
    startDate: string;
    endDate: string;
    copyClassStructureFromCurrent?: boolean;
}

export interface UpdateAcademicYearRequest {
    name?: string;
    startDate?: string;
    endDate?: string;
}

export interface CreateTermRequest {
    name: string;
    startDate: string;
    endDate: string;
}

export interface UpdateTermRequest {
    name?: string;
    startDate?: string;
    endDate?: string;
}
