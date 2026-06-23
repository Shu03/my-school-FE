import type { JSX } from "react";

import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    GraduationCap,
    University,
    BookOpen,
    Settings,
} from "lucide-react";

import { APP_BRAND } from "@constants/app.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: Role[];
}

const navItems: NavItem[] = [
    { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Users", path: ROUTES.USERS, icon: Users, roles: [Role.ADMIN] },
    { label: "Students", path: ROUTES.STUDENTS, icon: GraduationCap },
    { label: "Classes", path: ROUTES.CLASSES, icon: BookOpen },
    { label: "Settings", path: ROUTES.SETTINGS, icon: Settings, roles: [Role.ADMIN] },
];

export function Sidebar(): JSX.Element {
    const user = useAuthStore((s) => s.user);

    const visibleItems = navItems.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role)),
    );

    return (
        <aside className="text-sidebar-foreground flex h-full w-64 flex-col">
            {/* Brand */}
            <div className="flex h-16 items-center gap-3 px-5">
                <div className="bg-sidebar-primary/15 ring-sidebar-primary/25 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 backdrop-blur-sm">
                    <University className="text-sidebar-primary size-5" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-sidebar-foreground text-base font-bold tracking-tight">
                        {APP_BRAND.NAME}
                    </span>
                    <span className="text-sidebar-foreground/55 mt-1 text-[0.625rem] font-semibold tracking-[0.18em] uppercase">
                        {APP_BRAND.SHORT_NAME}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === ROUTES.DASHBOARD}
                        className={({ isActive }) =>
                            cn(
                                "group nav-shine relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 motion-reduce:hover:translate-x-0",
                                "before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:transition-all before:duration-200",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-foreground before:bg-sidebar-primary font-semibold before:scale-y-100"
                                    : "text-sidebar-foreground/65 hover:text-sidebar-foreground font-medium before:scale-y-0 hover:translate-x-px",
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={cn(
                                        "size-4 shrink-0 transition-all duration-200",
                                        isActive
                                            ? "text-sidebar-primary"
                                            : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground group-hover:scale-110 motion-reduce:group-hover:scale-100",
                                    )}
                                />
                                <span
                                    className={cn(
                                        "transition-all duration-200",
                                        isActive ? "text-sidebar-primary" : "text-current",
                                    )}
                                >
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-sidebar-border/60 border-t px-5 py-4">
                <p className="text-sidebar-foreground/45 truncate text-xs">{APP_BRAND.COPYRIGHT}</p>
            </div>
        </aside>
    );
}
