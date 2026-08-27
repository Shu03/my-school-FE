import type { JSX } from "react";

import { WelcomeBanner } from "./WelcomeBanner";

export function TeacherDashboard(): JSX.Element {
    return (
        <div className="space-y-6">
            <WelcomeBanner subtitle="Your classes, attendance, homework, and grades will appear here." />
        </div>
    );
}
