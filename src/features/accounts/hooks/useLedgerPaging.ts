import { useState } from "react";

import { ACCOUNT_PAGINATION } from "@constants/accounts.constants";

import type { AccountsPage } from "../types/account.types";

export interface LedgerPaging {
    page: number;
    limit: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    reset: () => void;
    /** Steps back when deletions leave the current page empty. Call during render. */
    clampTo: (result: AccountsPage<unknown> | undefined) => void;
}

export function useLedgerPaging(): LedgerPaging {
    const [page, setPage] = useState<number>(ACCOUNT_PAGINATION.DEFAULT_PAGE);
    const [limit, setLimitState] = useState<number>(ACCOUNT_PAGINATION.DEFAULT_LIMIT);

    return {
        page,
        limit,
        setPage,
        setLimit: (next) => {
            setLimitState(next);
            setPage(ACCOUNT_PAGINATION.DEFAULT_PAGE);
        },
        reset: () => setPage(ACCOUNT_PAGINATION.DEFAULT_PAGE),
        clampTo: (result) => {
            const lastPage = result ? Math.max(1, Math.ceil(result.total / limit)) : page;
            if (result && result.data.length === 0 && lastPage < page) {
                setPage(lastPage);
            }
        },
    };
}
