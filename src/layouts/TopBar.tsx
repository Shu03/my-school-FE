import type { JSX } from "react";

import { LogOut, PanelLeft } from "lucide-react";

import { useAuthStore } from "@features/auth";

import { ThemeToggle } from "@components/common/ThemeToggle";

import { Button } from "@/components/ui/button";

interface TopBarProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
    onToggleMobileSidebar: () => void;
}

export function TopBar({
    collapsed,
    onToggleCollapse,
    onToggleMobileSidebar,
}: TopBarProps): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 px-5">
            {/* Left: sidebar triggers + global greeting (fills the bar, not a per-page heading) */}
            <div className="flex min-w-0 items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleMobileSidebar}
                    aria-label="Open navigation menu"
                    className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hidden lg:inline-flex"
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>
                <span className="text-sidebar-foreground truncate text-sm font-semibold">
                    Welcome back, {user?.firstName ?? "User"}
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" />

                <div className="bg-sidebar-border mx-1 h-6 w-px" />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    aria-label="Log out"
                    className="gap-1.5"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Log out</span>
                </Button>
            </div>
        </header>
    );
}
