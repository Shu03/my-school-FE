import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export function getExamErrorMessage(error: unknown): string {
    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return "Validation failed. Check the subject grade level and exam status.";
        case HTTP_STATUS.FORBIDDEN:
            return "You are not allowed to manage this exam.";
        case HTTP_STATUS.NOT_FOUND:
            return "Exam not found.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Please sign in again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
