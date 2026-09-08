import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

import { useSearchParams } from "react-router-dom";

import { ClipboardCheck } from "lucide-react";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AttendanceMarker } from "../components/AttendanceMarker";
import { AttendanceOverviewView } from "../components/AttendanceOverviewView";

export function AttendancePage(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const isStudent = user?.role === Role.STUDENT;
    const canMark = user?.role === Role.ADMIN || user?.role === Role.TEACHER;
    const [searchParams] = useSearchParams();

    const initialTab = useMemo(() => {
        const requestedTab = searchParams.get("tab");
        if (requestedTab === "mark" && canMark) {
            return "mark";
        }

        return "overview";
    }, [canMark, searchParams]);

    const initialSectionId = searchParams.get("sectionId") ?? undefined;
    const [activeTab, setActiveTab] = useState<"mark" | "overview">(initialTab);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <ClipboardCheck className="size-5" />
                        Attendance
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Mark and review daily student attendance.
                    </p>
                </div>

                <div className="px-6 py-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as "mark" | "overview")}
                    >
                        <TabsList className="h-10 w-full">
                            {canMark && <TabsTrigger value="mark">Mark</TabsTrigger>}
                            <TabsTrigger value="overview">
                                {isStudent ? "My Attendance" : "Overview"}
                            </TabsTrigger>
                        </TabsList>

                        {canMark && (
                            <TabsContent value="mark" className="pt-4">
                                <AttendanceMarker initialSectionId={initialSectionId} />
                            </TabsContent>
                        )}

                        <TabsContent value="overview" className="pt-4">
                            <AttendanceOverviewView />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
