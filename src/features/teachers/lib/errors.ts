import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getTeacherErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
        case HTTP_STATUS.CONFLICT:
            return "Please review your input. Values must be valid and unique.";
        case HTTP_STATUS.FORBIDDEN:
            return "You can only access your own data.";
        case HTTP_STATUS.NOT_FOUND:
            return "The requested record was not found.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}

export function getPresetDeleteErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    if (status === HTTP_STATUS.BAD_REQUEST) {
        return "This preset cannot be deleted while it is assigned to teachers.";
    }

    return getTeacherErrorMessage(error);
}

export function getAssignmentErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    if (status === HTTP_STATUS.BAD_REQUEST) {
        return "Invalid assignment. Check the role, subject, and that grade levels match. A class can have only one class teacher.";
    }

    return getTeacherErrorMessage(error);
}
