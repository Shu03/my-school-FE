import { HTTP_STATUS } from "@constants/httpStatus.constants";

import { ApiError } from "@lib/api/client";

/** Server messages carry the exact available amounts, so they always win. */
export function getAccountsErrorMessage(error: unknown): string {
    if (error instanceof ApiError && error.serverMessage) {
        return error.serverMessage;
    }

    const status = error instanceof ApiError ? error.status : undefined;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return "Some details are invalid. Check the amounts and dates, then try again.";
        case HTTP_STATUS.FORBIDDEN:
            return "Only admins can manage school accounts.";
        case HTTP_STATUS.NOT_FOUND:
            return "This entry no longer exists. Refresh the list and try again.";
        case HTTP_STATUS.UNAUTHORIZED:
            return "Your session has expired. Sign in again to continue.";
        default:
            return "Couldn't reach the accounts service. Check your connection and try again.";
    }
}
