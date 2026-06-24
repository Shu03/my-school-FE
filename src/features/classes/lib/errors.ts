import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getClassErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
        case HTTP_STATUS.CONFLICT:
            return "Please review your input. Class name must be unique within the selected academic year.";
        case HTTP_STATUS.NOT_FOUND:
            return "The requested class, academic year, or teacher was not found.";
        case HTTP_STATUS.FORBIDDEN:
            return "You do not have permission to perform this action.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
