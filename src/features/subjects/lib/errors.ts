import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getSubjectErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
        case HTTP_STATUS.CONFLICT:
            return "Please review your input. Subject name and code must be unique within the grade.";
        case HTTP_STATUS.NOT_FOUND:
            return "The requested subject was not found.";
        case HTTP_STATUS.FORBIDDEN:
            return "You do not have permission to perform this action.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}

export function getSubjectDeleteErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    if (status === HTTP_STATUS.BAD_REQUEST) {
        return "This subject cannot be deleted while it has active teacher assignments.";
    }

    return getSubjectErrorMessage(error);
}
