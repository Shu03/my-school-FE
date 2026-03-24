import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clearTokens, setTokens } from "@/api/client";

import type { User } from "@/types";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;

    // Force password change (first login)
    forcePasswordChange: boolean;
    firstLoginToken: string | null;

    // Actions
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
    setForcePasswordChange: (token: string) => void;
    clearForcePasswordChange: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            forcePasswordChange: false,
            firstLoginToken: null,

            login: (user, accessToken, refreshToken): void => {
                setTokens(accessToken, refreshToken);
                set({
                    user,
                    isAuthenticated: true,
                    forcePasswordChange: false,
                    firstLoginToken: null,
                });
            },

            logout: (): void => {
                clearTokens();
                set({
                    user: null,
                    isAuthenticated: false,
                    forcePasswordChange: false,
                    firstLoginToken: null,
                });
            },

            setUser: (user): void => {
                set({ user });
            },

            setForcePasswordChange: (token): void => {
                set({
                    forcePasswordChange: true,
                    firstLoginToken: token,
                    isAuthenticated: false,
                });
            },

            clearForcePasswordChange: (): void => {
                set({
                    forcePasswordChange: false,
                    firstLoginToken: null,
                });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);
