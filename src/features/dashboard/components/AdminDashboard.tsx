import type { JSX } from "react";

import { HolidaysWidget } from "@features/holidays";

import { Stagger, StaggerItem } from "@components/common/Motion";

import { ADMIN_STATS } from "../lib/mockStats";

import { StatCard } from "./StatCard";

export function AdminDashboard(): JSX.Element {
    return (
        <div className="space-y-6">
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ADMIN_STATS.map((stat) => (
                    <StaggerItem key={stat.label}>
                        <StatCard stat={stat} />
                    </StaggerItem>
                ))}
            </Stagger>

            <div className="grid gap-6 lg:grid-cols-2">
                <HolidaysWidget />
            </div>
        </div>
    );
}
