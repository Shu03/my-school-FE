import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getStudentErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.CONFLICT:
            return "That admission number is already taken.";
        case HTTP_STATUS.BAD_REQUEST:
            return "Please review your input and try again.";
        case HTTP_STATUS.NOT_FOUND:
            return "The requested student was not found.";
        case HTTP_STATUS.FORBIDDEN:
            return "You do not have permission to perform this action.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}

export function getEnrollErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.CONFLICT:
            return "This student is already enrolled for the selected academic year.";
        case HTTP_STATUS.BAD_REQUEST:
            return "The selected class does not belong to the chosen academic year.";
        default:
            return getStudentErrorMessage(error);
    }
}
