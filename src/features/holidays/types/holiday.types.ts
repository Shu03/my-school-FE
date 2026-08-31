export interface Holiday {
    id: string;
    name: string;
    date: string;
    academicYearId: string;
    createdAt: string;
    updatedAt: string;
}

export interface HolidaysListParams {
    academicYearId?: string;
}

export interface CreateHolidayRequest {
    name: string;
    date: string;
    academicYearId: string;
}
