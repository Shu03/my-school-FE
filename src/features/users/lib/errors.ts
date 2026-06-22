import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

/**
 * Maps an API error to a user-facing message for user create/update flows.
 * The HTTP client surfaces only the status code, so messages are status-based.
 */
export function getUserErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
        case HTTP_STATUS.CONFLICT:
            return "A unique value is already in use. Check the mobile number, email, employee code, or admission number.";
        case HTTP_STATUS.NOT_FOUND:
            return "User not found. It may have been removed.";
        case HTTP_STATUS.FORBIDDEN:
            return "You don't have permission to perform this action.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
