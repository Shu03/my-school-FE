import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getFeeErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return "Validation failed. Check the amount and due date.";
        case HTTP_STATUS.CONFLICT:
            return "A fee structure already exists for this grade and year.";
        case HTTP_STATUS.FORBIDDEN:
            return "You are not allowed to manage fees.";
        case HTTP_STATUS.NOT_FOUND:
            return "Fee record not found.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
