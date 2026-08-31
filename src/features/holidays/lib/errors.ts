import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getHolidayErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return "Please review your inputs. Check the holiday name and date.";
        case HTTP_STATUS.CONFLICT:
            return "A holiday already exists on this date.";
        case HTTP_STATUS.FORBIDDEN:
            return "You do not have permission to perform this action.";
        case HTTP_STATUS.NOT_FOUND:
            return "The selected holiday was not found.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
