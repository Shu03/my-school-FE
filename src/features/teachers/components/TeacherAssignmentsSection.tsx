import { useMemo, useState, type JSX } from "react";

import { BookOpen, Layers3, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { TeacherAssignment } from "../types/teacher.types";

interface TeacherAssignmentsSectionProps {
    assignments: TeacherAssignment[];
    isLoading: boolean;
    canManage: boolean;
    deletingAssignmentId: string | null;
    onAdd: () => void;
    onDelete: (assignment: TeacherAssignment) => void;
    embedded?: boolean;
}

export function TeacherAssignmentsSection({
    assignments,
    isLoading,
    canManage,
    deletingAssignmentId,
    onAdd,
    onDelete,
    embedded = false,
}: TeacherAssignmentsSectionProps): JSX.Element {
    const [search, setSearch] = useState("");
    const groups = useMemo(() => {
        const query = search.trim().toLowerCase();
        const filtered = assignments.filter(
            (assignment) =>
                !query ||
                assignment.class.name.toLowerCase().includes(query) ||
                assignment.subject?.name.toLowerCase().includes(query) ||
                assignment.subject?.code.toLowerCase().includes(query),
        );

        return Array.from(
            filtered.reduce<Map<string, TeacherAssignment[]>>((result, assignment) => {
                const current = result.get(assignment.classId) ?? [];
                current.push(assignment);
                result.set(assignment.classId, current);
                return result;
            }, new Map()),
        );
    }, [assignments, search]);

    const content = (
        <>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Class assignments</CardTitle>
                {canManage && (
                    <Button size="sm" onClick={onAdd}>
                        <Plus className="size-4" />
                        Add assignment
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                {!isLoading && assignments.length > 4 ? (
                    <label className="relative mb-4 block">
                        <span className="sr-only">Search assignments</span>
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Find Section or subject"
                            className="pl-9"
                        />
                    </label>
                ) : null}
                {isLoading && (
                    <div className="flex items-center gap-2 py-4">
                        <Spinner className="size-4" />
                        <span className="text-muted-foreground text-sm">
                            Loading assignments...
                        </span>
                    </div>
                )}

                {!isLoading && assignments.length === 0 && (
                    <p className="text-muted-foreground py-4 text-sm">No assignments yet.</p>
                )}

                {!isLoading && assignments.length > 0 && groups.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                        No assignments match your search.
                    </p>
                ) : null}

                {!isLoading &&
                    groups.map(([classId, classAssignments]) => {
                        const first = classAssignments[0];
                        if (!first) return null;
                        return (
                            <section
                                key={classId}
                                className="border-border/70 overflow-hidden rounded-xl border"
                            >
                                <div className="bg-muted/35 border-border/60 flex items-center gap-2 border-b px-3 py-2.5">
                                    <Layers3 className="text-primary size-4" />
                                    <h3 className="text-sm font-semibold">
                                        Class {first.class.gradeLevel} · Section {first.class.name}
                                    </h3>
                                    <Badge variant="secondary" className="ml-auto">
                                        {classAssignments.length}
                                    </Badge>
                                </div>
                                <div className="divide-border/60 divide-y">
                                    {classAssignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center gap-3 px-3 py-3"
                                        >
                                            <BookOpen className="text-muted-foreground size-4 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {assignment.role === "CLASS_TEACHER"
                                                        ? "Section teacher"
                                                        : (assignment.subject?.name ?? "Subject")}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {assignment.role === "CLASS_TEACHER"
                                                        ? "Responsible for this Section"
                                                        : assignment.subject?.code}
                                                </p>
                                            </div>
                                            {canManage ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-lg"
                                                            className="text-destructive"
                                                            aria-label={`Remove assignment for ${first.class.name}`}
                                                            onClick={() => onDelete(assignment)}
                                                            disabled={
                                                                deletingAssignmentId ===
                                                                assignment.id
                                                            }
                                                        >
                                                            {deletingAssignmentId ===
                                                            assignment.id ? (
                                                                <Spinner className="size-4" />
                                                            ) : (
                                                                <Trash2 className="size-4" />
                                                            )}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Remove assignment
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
            </CardContent>
        </>
    );

    return embedded ? <div className="-mx-1">{content}</div> : <Card>{content}</Card>;
}
