/**
 * Public API of the auth feature.
 *
 * Pages are intentionally NOT exported here — the router loads them directly
 * via dynamic import (see app/router/lazy.tsx) to preserve code-splitting.
 */

// Store
export { useAuthStore } from "./store/auth.store";

// App-shell bootstrap hooks
export { useAuthInitializer } from "./hooks/useAuthInitializer";
export { useProactiveTokenRefresh } from "./hooks/useProactiveTokenRefresh";
export { useSessionExpiredListener } from "./hooks/useSessionExpiredListener";

// Domain types & guards
export { isForcePasswordChange } from "./types/auth.types";
export type {
    ChangePasswordRequest,
    ForcePasswordChangeResponse,
    LoginRequest,
    LoginResponse,
    LoginSuccessResponse,
    RefreshRequest,
    RefreshResponse,
    ResetPasswordRequest,
    User,
} from "./types/auth.types";
