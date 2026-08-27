import type { JSX } from "react";

import { WelcomeBanner } from "./WelcomeBanner";

export function StudentDashboard(): JSX.Element {
    return (
        <div className="space-y-6">
            <WelcomeBanner subtitle="Your attendance, report card, homework, and announcements will appear here." />
        </div>
    );
}
