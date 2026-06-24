import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getAcademicYearErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return "Please review your inputs. Date range, overlap, or uniqueness rules may have failed.";
        case HTTP_STATUS.FORBIDDEN:
            return "You do not have permission to perform this action.";
        case HTTP_STATUS.NOT_FOUND:
            return "The selected academic year or term was not found.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
