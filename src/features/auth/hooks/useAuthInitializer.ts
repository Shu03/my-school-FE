import { useEffect } from "react";

import { getAccessToken } from "@lib/api/tokenStorage";

import { getMe } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

/**
 * Initialize auth state on app startup by:
 * 1. Checking if tokens exist in localStorage
 * 2. Validating tokens by fetching /auth/me
 * 3. Hydrating user state in store
 * 4. Marking initialization complete
 *
 * This hook should be called once at app root to prevent redirect flicker
 * and ensure user data is restored after page refresh.
 */
export function useAuthInitializer(): void {
    const { login, logout, setAuthInitializing, forcePasswordChange, isAuthenticated } =
        useAuthStore();

    useEffect(() => {
        async function initializeAuth(): Promise<void> {
            try {
                const token = getAccessToken();

                // If no token exists, initialization is complete
                if (!token) {
                    setAuthInitializing(false);
                    return;
                }

                // Skip initialization if already authenticated or in forced password change flow
                if (isAuthenticated || forcePasswordChange) {
                    setAuthInitializing(false);
                    return;
                }

                // Validate token by fetching current user profile
                const user = await getMe();

                // Token is valid, hydrate user state
                // Note: setUser would be used here, but we need to maintain the pattern
                // The user was fetched successfully, which means token is valid
                // Store will already have tokens from localStorage via persistence
                useAuthStore.setState({
                    user,
                    isAuthenticated: true,
                    isAuthInitializing: false,
                });
            } catch {
                // Token validation failed (401 Unauthorized or network error)
                // Clear auth state and mark as done initializing
                logout();
                setAuthInitializing(false);
            }
        }

        initializeAuth();
    }, [login, logout, setAuthInitializing, forcePasswordChange, isAuthenticated]);
}
