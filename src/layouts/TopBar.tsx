import type { JSX } from "react";

import { LogOut, Bell } from "lucide-react";

import { useAuthStore } from "@features/auth";

import { ThemeToggle } from "@components/common/ThemeToggle";

import { Button } from "@/components/ui/button";

export function TopBar(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between px-5">
            {/* Left: global greeting (fills the bar, not a per-page heading) */}
            <span className="text-sidebar-foreground text-sm font-semibold">
                Welcome back, {user?.firstName ?? "User"}
            </span>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                <ThemeToggle className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" />

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground relative"
                >
                    <Bell className="h-5 w-5" />
                    <span className="bg-sidebar-primary ring-sidebar absolute top-2 right-2 size-2 rounded-full ring-2" />
                </Button>

                <div className="bg-sidebar-border mx-2 h-6 w-px" />

                {/* User avatar/info */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold shadow-sm">
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                        </div>
                        <span className="bg-success ring-sidebar absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sidebar-foreground text-sm leading-tight font-medium">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sidebar-foreground/60 text-xs capitalize">
                            {user?.role?.toLowerCase()}
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    aria-label="Log out"
                    className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive ml-1"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
