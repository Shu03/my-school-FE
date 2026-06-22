import type { JSX, ReactNode } from "react";

import { useAuthInitializer, useAuthStore, useProactiveTokenRefresh } from "@features/auth";

import { Spinner } from "@/components/ui/spinner";


interface AuthInitializerProps {
    children: ReactNode;
}

/**
 * Wraps the app to ensure auth state is hydrated before rendering routes.
 * Shows a loading spinner while validating tokens and fetching user profile.
 *
 * This prevents:
 * - Login page flicker when tokens are valid but user data not yet loaded
 * - Redirect loops during token validation
 * - Incomplete auth state in initial render
 *
 * Also initializes proactive token refresh to keep access tokens fresh.
 */
export function AuthInitializer({ children }: AuthInitializerProps): JSX.Element {
    const isAuthInitializing = useAuthStore((s) => s.isAuthInitializing);

    // Trigger auth initialization on mount
    useAuthInitializer();

    // Start proactive token refresh after initialization
    useProactiveTokenRefresh();

    if (isAuthInitializing) {
        return (
            <div className="flex min-h-svh items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Spinner className="size-8" />
                    <p className="text-muted-foreground text-sm">Initializing...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
