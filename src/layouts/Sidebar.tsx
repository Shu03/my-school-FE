import type { JSX } from "react";

import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    University,
    BookOpen,
    CalendarRange,
    UserRound,
    ClipboardCheck,
    ClipboardList,
    NotebookPen,
    Megaphone,
    Wallet,
} from "lucide-react";

import { APP_BRAND } from "@constants/app.constants";
import { PERMISSIONS } from "@constants/permissions.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import type { User } from "@features/auth";
import { hasPermission, useAuthStore } from "@features/auth";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: Role[];
    canView?: (user: User | null) => boolean;
}

function canAccessAcademicYears(user: User | null): boolean {
    if (!user) {
        return false;
    }

    return (
        user.role === Role.ADMIN ||
        (user.role === Role.TEACHER &&
            hasPermission(user.permissions, PERMISSIONS.ACADEMIC_YEAR_MANAGE))
    );
}

function canAccessClasses(user: User | null): boolean {
    if (!user) {
        return false;
    }

    return (
        user.role === Role.ADMIN ||
        (user.role === Role.TEACHER && hasPermission(user.permissions, PERMISSIONS.CLASS_MANAGE))
    );
}

function canAccessFees(user: User | null): boolean {
    if (!user) {
        return false;
    }

    return (
        user.role === Role.ADMIN ||
        (user.role === Role.TEACHER && hasPermission(user.permissions, PERMISSIONS.FEES_MANAGE))
    );
}

const navItems: NavItem[] = [
    { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Users", path: ROUTES.USERS, icon: Users, roles: [Role.ADMIN] },
    { label: "Teachers", path: ROUTES.TEACHERS, icon: UserRound, roles: [Role.ADMIN] },
    {
        label: "Academic Years",
        path: ROUTES.ACADEMIC_YEARS,
        icon: CalendarRange,
        canView: canAccessAcademicYears,
    },
    {
        label: "Classes",
        path: ROUTES.CLASSES,
        icon: BookOpen,
        canView: canAccessClasses,
    },
    {
        label: "Attendance",
        path: ROUTES.ATTENDANCE,
        icon: ClipboardCheck,
        roles: [Role.ADMIN, Role.TEACHER],
    },
    { label: "Homework", path: ROUTES.HOMEWORK, icon: NotebookPen },
    { label: "Announcements", path: ROUTES.ANNOUNCEMENTS, icon: Megaphone },
    { label: "Exams", path: ROUTES.EXAMS, icon: ClipboardList },
    {
        label: "Fees",
        path: ROUTES.FEES,
        icon: Wallet,
        canView: canAccessFees,
    },
    { label: "My Fees", path: ROUTES.MY_FEES, icon: Wallet, roles: [Role.STUDENT] },
];

interface SidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps): JSX.Element {
    const user = useAuthStore((s) => s.user);

    const visibleItems = navItems.filter(
        (item) =>
            (!item.roles || (user && item.roles.includes(user.role))) &&
            (!item.canView || item.canView(user)),
    );

    const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User";

    return (
        <aside
            className={cn(
                "text-sidebar-foreground fixed inset-y-0 left-0 z-40 flex h-full flex-col transition-transform duration-200 motion-reduce:transition-none lg:static lg:translate-x-0 lg:transition-[width]",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
                collapsed ? "w-64 lg:w-18" : "w-64",
            )}
        >
            {/* Brand */}
            <div className="flex h-16 items-center gap-3 px-5">
                <div className="bg-sidebar-primary/15 ring-sidebar-primary/25 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 backdrop-blur-sm">
                    <University className="text-sidebar-primary size-5" />
                </div>
                <div className={cn("flex flex-col leading-none", collapsed && "lg:hidden")}>
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
                {visibleItems.map((item) => {
                    const link = (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === ROUTES.DASHBOARD}
                            aria-label={item.label}
                            onClick={onCloseMobile}
                            className={({ isActive }) =>
                                cn(
                                    "group nav-shine relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 motion-reduce:hover:translate-x-0",
                                    "before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:transition-all before:duration-200",
                                    collapsed && "lg:justify-center lg:px-0",
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
                                            collapsed && "lg:hidden",
                                            isActive ? "text-sidebar-primary" : "text-current",
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );

                    if (!collapsed) {
                        return link;
                    }

                    return (
                        <Tooltip key={item.path}>
                            <TooltipTrigger asChild className="hidden lg:block">
                                {link}
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                            <span className="lg:hidden">{link}</span>
                        </Tooltip>
                    );
                })}
            </nav>

            {/* Footer: profile */}
            <div className="border-sidebar-border/60 border-t px-3 py-3">
                {collapsed ? (
                    <Tooltip>
                        <TooltipTrigger asChild className="hidden lg:flex lg:justify-center">
                            <NavLink
                                to={ROUTES.PROFILE}
                                aria-label={`View profile: ${fullName}`}
                                onClick={onCloseMobile}
                                className="hover:bg-sidebar-accent flex items-center justify-center rounded-lg p-1.5 transition-colors"
                            >
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold shadow-sm">
                                    {initials}
                                </div>
                            </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {fullName} · {user?.role?.toLowerCase()}
                        </TooltipContent>
                    </Tooltip>
                ) : null}
                <NavLink
                    to={ROUTES.PROFILE}
                    aria-label="View profile"
                    onClick={onCloseMobile}
                    className={cn(
                        "hover:bg-sidebar-accent flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                        collapsed && "lg:hidden",
                    )}
                >
                    <div className="relative shrink-0">
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold shadow-sm">
                            {initials}
                        </div>
                        <span className="bg-success ring-sidebar absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sidebar-foreground truncate text-sm leading-tight font-medium">
                            {fullName}
                        </p>
                        <p className="text-sidebar-foreground/60 truncate text-xs capitalize">
                            {user?.role?.toLowerCase()}
                        </p>
                    </div>
                </NavLink>
                <p
                    className={cn(
                        "text-sidebar-foreground/45 mt-2 truncate px-2 text-xs",
                        collapsed && "lg:hidden",
                    )}
                >
                    {APP_BRAND.COPYRIGHT}
                </p>
            </div>
        </aside>
    );
}
