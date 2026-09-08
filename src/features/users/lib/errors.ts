import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

/**
 * Maps an API error to a user-facing message for user create/update flows.
 * Prefers the server-provided message, falling back to status-based defaults.
 */
export function getUserErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.serverMessage) {
            return error.serverMessage;
        }

        switch (error.status) {
            case HTTP_STATUS.BAD_REQUEST:
            case HTTP_STATUS.CONFLICT:
                return "A unique value is already in use. Check the mobile number, email, employee code, or admission number.";
            case HTTP_STATUS.NOT_FOUND:
                return "User not found. It may have been removed.";
            case HTTP_STATUS.FORBIDDEN:
                return "You don't have permission to perform this action.";
            case HTTP_STATUS.UNAUTHORIZED:
                return "Your session has expired. Please sign in again.";
        }
    }

    return "Something went wrong. Please try again.";
}
