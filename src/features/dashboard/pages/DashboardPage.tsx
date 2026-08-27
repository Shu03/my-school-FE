import type { JSX } from "react";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { AdminDashboard } from "../components/AdminDashboard";
import { StudentDashboard } from "../components/StudentDashboard";
import { TeacherDashboard } from "../components/TeacherDashboard";

export function DashboardPage(): JSX.Element {
    const role = useAuthStore((s) => s.user?.role);

    if (role === Role.TEACHER) {
        return <TeacherDashboard />;
    }
    if (role === Role.STUDENT) {
        return <StudentDashboard />;
    }
    return <AdminDashboard />;
}
