import type { JSX } from "react";

import { NavLink } from "react-router-dom";

import { LayoutDashboard, Users, GraduationCap, BookOpen, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

import { useAuthStore } from "@/stores/auth.store";

import { Role } from "@/types";

interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: Role[];
}

const navItems: NavItem[] = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Users", path: "/users", icon: Users, roles: [Role.ADMIN] },
    { label: "Students", path: "/students", icon: GraduationCap },
    { label: "Classes", path: "/classes", icon: BookOpen },
    { label: "Settings", path: "/settings", icon: Settings, roles: [Role.ADMIN] },
];

export function Sidebar(): JSX.Element {
    const user = useAuthStore((s) => s.user);

    const visibleItems = navItems.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role)),
    );

    return (
        <aside className="bg-sidebar flex h-full w-64 flex-col">
            {/* Brand */}
            <div className="flex h-16 items-center gap-2 px-6">
                <GraduationCap className="text-sidebar-primary h-7 w-7" />
                <span className="text-sidebar-foreground text-lg font-bold">MySchool</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                            cn(
                                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                                isActive
                                    ? "bg-primary/8 text-primary before:bg-primary font-semibold before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-full"
                                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground font-medium",
                            )
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3">
                <p className="text-sidebar-foreground/50 truncate text-xs">© 2026 MySchool</p>
            </div>
        </aside>
    );
}
