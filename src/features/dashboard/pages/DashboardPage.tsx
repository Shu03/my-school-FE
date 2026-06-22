import type { JSX } from "react";

import { Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
    { label: "Total Students", value: "1,234", icon: GraduationCap, trend: "+12%" },
    { label: "Total Teachers", value: "56", icon: Users, trend: "+3%" },
    { label: "Active Classes", value: "42", icon: BookOpen, trend: "0%" },
    { label: "Attendance Rate", value: "94%", icon: TrendingUp, trend: "+2%" },
];

export function DashboardPage(): JSX.Element {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-muted-foreground text-xs">
                                {stat.trend} from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
