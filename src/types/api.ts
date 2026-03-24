export const Role = {
    ADMIN: "ADMIN",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface ApiEnvelope<T> {
    success: boolean;
    statusCode: number;
    timestamp: string;
    data: T;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}
