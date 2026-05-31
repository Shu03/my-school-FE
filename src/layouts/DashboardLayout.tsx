import type { JSX } from "react";

import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DashboardLayout(): JSX.Element {
    return (
        <div className="bg-sidebar flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar />

                {/* Page content */}
                <main className="bg-background ring-border/50 m-3 mt-0 flex-1 overflow-y-auto rounded-2xl p-6 shadow-sm ring-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
