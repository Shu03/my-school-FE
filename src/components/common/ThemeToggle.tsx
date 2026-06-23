import type { JSX } from "react";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme.store";

interface ThemeToggleProps {
    className?: string;
}

/** Light/dark theme switcher with an animated sun/moon crossfade. */
export function ThemeToggle({ className }: ThemeToggleProps): JSX.Element {
    const theme = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={cn("text-muted-foreground hover:text-foreground relative", className)}
        >
            <Sun className="size-5 scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-5 scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0" />
        </Button>
    );
}
