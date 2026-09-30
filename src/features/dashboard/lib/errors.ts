import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

export type DashboardErrorKind =
    | "unauthorized"
    | "profileMissing"
    | "noAcademicYear"
    | "rateLimited"
    | "generic";

export function getDashboardErrorKind(error: unknown): DashboardErrorKind {
    if (!(error instanceof ApiError)) {
        return "generic";
    }
    switch (error.status) {
        case HTTP_STATUS.UNAUTHORIZED:
            return "unauthorized";
        case HTTP_STATUS.FORBIDDEN:
            return "profileMissing";
        case HTTP_STATUS.NOT_FOUND:
            return "noAcademicYear";
        case HTTP_STATUS.TOO_MANY_REQUESTS:
            return "rateLimited";
        default:
            return "generic";
    }
}

export function getServerMessage(error: unknown): string | undefined {
    return error instanceof ApiError ? error.serverMessage : undefined;
}
