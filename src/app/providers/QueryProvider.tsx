import type { JSX, ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { QUERY_CONFIG } from "@constants/query.constants";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: QUERY_CONFIG.STALE_TIME_MS,
            retry: QUERY_CONFIG.RETRY_COUNT,
            refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
