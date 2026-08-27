import type { JSX } from "react";

import { ClipboardCheck } from "lucide-react";

import { Role } from "@/types/api";

import { useAuthStore } from "@features/auth";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AttendanceMarker } from "../components/AttendanceMarker";
import { AttendanceSummaryView } from "../components/AttendanceSummaryView";
import { ClassAttendanceView } from "../components/ClassAttendanceView";

export function AttendancePage(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;

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
                    <Tabs defaultValue="mark">
                        <TabsList>
                            <TabsTrigger value="mark">Mark</TabsTrigger>
                            {isAdmin && <TabsTrigger value="view">View</TabsTrigger>}
                            {isAdmin && <TabsTrigger value="summary">Summary</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="mark" className="pt-4">
                            <AttendanceMarker />
                        </TabsContent>

                        {isAdmin && (
                            <TabsContent value="view" className="pt-4">
                                <ClassAttendanceView />
                            </TabsContent>
                        )}

                        {isAdmin && (
                            <TabsContent value="summary" className="pt-4">
                                <AttendanceSummaryView />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
