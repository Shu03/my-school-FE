import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { AUTH_EVENTS } from "@constants/auth.constants";
import { ROUTES } from "@constants/routes.constants";

import { useAuthStore } from "../store/auth.store";

/**
 * Listen for session expiration events and handle logout/redirect.
 * Called from ProtectedRoute to ensure expiry handling on protected pages.
 *
 * When refresh fails (token invalid/expired), this listener:
 * 1. Clears auth state
 * 2. Shows session-expired message
 * 3. Redirects to login
 */
export function useSessionExpiredListener(): void {
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();

    useEffect(() => {
        function handleSessionExpired(): void {
            // Clear auth state
            logout();

            // Pass state to login page for messaging
            navigate(ROUTES.LOGIN, {
                replace: true,
                state: { sessionExpired: true },
            });
        }

        window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
        return () => {
            window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
        };
    }, [logout, navigate]);
}
