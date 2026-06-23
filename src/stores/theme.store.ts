import { create } from "zustand";

import { STORAGE_KEYS } from "@constants/storageKeys.constants";

export type Theme = "light" | "dark";

/** Resolve the boot theme: persisted preference first, then the OS preference. */
function getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === "light" || stored === "dark") {
        return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Reflect the active theme onto the document so CSS tokens (.dark) switch. */
function applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
}

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: getInitialTheme(),
    setTheme: (theme): void => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        applyTheme(theme);
        set({ theme });
    },
    toggleTheme: (): void => {
        get().setTheme(get().theme === "dark" ? "light" : "dark");
    },
}));

/** Apply the resolved theme to the document on app boot (call before first paint). */
export function initTheme(): void {
    applyTheme(useThemeStore.getState().theme);
}
