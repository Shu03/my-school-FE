import type { JSX } from "react";

import { Outlet, useLocation } from "react-router-dom";

import { PageTransition } from "@components/common/Motion";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DashboardLayout(): JSX.Element {
    const location = useLocation();
    return (
        <div className="flex h-screen overflow-hidden bg-[radial-gradient(180%_160%_at_160%_120%,oklch(0.79_0.18_56.8)_0%,oklch(0.87_0.08_57.69)_60%_70%,var(--color-sidebar-dark)_100%)] dark:bg-[radial-gradient(180%_160%_at_160%_120%,oklch(0.35_0.055_42)_0%,oklch(0.29_0.05_40)_70%_60%,oklch(0.17_0.045_38)_100%)]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar />

                {/* Page content — the single elevated surface above the unified chrome */}
                <main className="bg-card ring-foreground/5 mx-4 mt-1 mb-4 flex-1 overflow-y-auto rounded-2xl p-6 shadow-xl ring-1">
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </main>
            </div>
        </div>
    );
}
