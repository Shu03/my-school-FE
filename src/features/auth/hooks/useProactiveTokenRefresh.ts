import { useEffect, useRef } from "react";

import { TOKEN_REFRESH_LEAD_MS } from "@constants/auth.constants";

import { getAccessToken, getRefreshToken, setTokens } from "@lib/api/tokenStorage";
import { getMillisecondsUntilExpiry } from "@lib/jwt";

import { refreshToken as refreshTokenAPI } from "../api/auth.api";

/**
 * Proactively refresh access token 1-2 minutes before expiry.
 * Supplements reactive 401 refresh by ensuring tokens are fresh before they expire.
 * Silent refresh: no user interaction required if successful.
 *
 * This hook runs periodically and calculates when to refresh based on JWT exp claim.
 */
export function useProactiveTokenRefresh(): void {
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    useEffect(() => {
        function scheduleTokenRefresh(): void {
            // Clear any existing timeout
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }

            const accessToken = getAccessToken();
            const refreshTokenValue = getRefreshToken();

            // Skip if no tokens
            if (!accessToken || !refreshTokenValue) {
                return;
            }

            const msUntilExpiry = getMillisecondsUntilExpiry(accessToken);

            // Skip if token already expired or invalid
            if (msUntilExpiry <= 0) {
                return;
            }

            // Calculate refresh time: 1.5 minutes before expiry
            const msUntilRefresh = msUntilExpiry - TOKEN_REFRESH_LEAD_MS;

            // If should refresh now or soon
            if (msUntilRefresh <= 0) {
                // Refresh immediately
                void performTokenRefresh();
            } else {
                // Schedule refresh for later
                timeoutIdRef.current = setTimeout(() => {
                    void performTokenRefresh();
                }, msUntilRefresh);
            }
        }

        async function performTokenRefresh(): Promise<void> {
            // Prevent concurrent refresh attempts
            if (isRefreshingRef.current) {
                return;
            }

            isRefreshingRef.current = true;

            try {
                const refreshTokenValue = getRefreshToken();
                if (!refreshTokenValue) {
                    return;
                }

                const response = await refreshTokenAPI(refreshTokenValue);

                // Update tokens and reschedule
                setTokens(response.accessToken, response.refreshToken);

                // Reschedule next refresh
                scheduleTokenRefresh();
            } catch {
                // Refresh failed; will be handled by reactive 401 refresh on next API call
                // Silent failure; user won't notice since reactive refresh handles it
            } finally {
                isRefreshingRef.current = false;
            }
        }

        // Initial schedule
        scheduleTokenRefresh();

        // Cleanup on unmount
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, []);
}
