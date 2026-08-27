import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getHomeworkErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return "Please review your input and try again.";
        case HTTP_STATUS.NOT_FOUND:
            return "The homework was not found.";
        case HTTP_STATUS.FORBIDDEN:
            return "You are not assigned to this class or lack permission.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
