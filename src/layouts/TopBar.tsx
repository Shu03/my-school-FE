import type { JSX } from "react";

import { LogOut, Bell } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";

export function TopBar(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className="bg-sidebar flex h-16 items-center justify-between px-6">
            {/* Left: Page context / breadcrumb area */}
            <div>
                <h1 className="text-sidebar-foreground text-lg font-semibold">
                    Welcome back, {user?.firstName ?? "User"}
                </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Bell className="h-5 w-5" />
                </Button>

                {/* User avatar/info */}
                <div className="flex items-center gap-3 rounded-md px-3 py-1.5">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-foreground text-sm font-medium">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs capitalize">
                            {user?.role?.toLowerCase()}
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
