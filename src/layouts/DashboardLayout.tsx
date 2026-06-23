import type { JSX } from "react";

import { Outlet, useLocation } from "react-router-dom";

import { PageTransition } from "@components/common/Motion";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DashboardLayout(): JSX.Element {
    const location = useLocation();
    return (
        <div className="flex h-screen overflow-hidden bg-[radial-gradient(135%_135%_at_0%_0%,var(--color-sidebar-light)_0%,var(--color-sidebar)_42%,var(--color-sidebar-dark)_100%)]">
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
