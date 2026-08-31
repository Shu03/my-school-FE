import type { JSX } from "react";

import { HolidaysWidget } from "@features/holidays";

import { WelcomeBanner } from "./WelcomeBanner";

export function StudentDashboard(): JSX.Element {
    return (
        <div className="space-y-6">
            <WelcomeBanner subtitle="Your attendance, report card, homework, and announcements will appear here." />
            <div className="grid gap-6 lg:grid-cols-2">
                <HolidaysWidget />
            </div>
        </div>
    );
}
