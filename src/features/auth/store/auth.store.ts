import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@constants/storageKeys.constants";

import { clearTokens, setTokens } from "@lib/api/tokenStorage";

import type { User } from "../types/auth.types";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;

    // Force password change (first login)
    forcePasswordChange: boolean;
    firstLoginToken: string | null;

    // Auth initialization state
    isAuthInitializing: boolean;

    // Actions
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
    setForcePasswordChange: (token: string) => void;
    clearForcePasswordChange: () => void;
    setAuthInitializing: (initializing: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            forcePasswordChange: false,
            firstLoginToken: null,
            isAuthInitializing: true, // Start as initializing to prevent render flicker

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

            setAuthInitializing: (initializing): void => {
                set({ isAuthInitializing: initializing });
            },
        }),
        {
            name: STORAGE_KEYS.AUTH_STORE,
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                forcePasswordChange: state.forcePasswordChange,
                firstLoginToken: state.firstLoginToken,
            }),
        },
    ),
);
