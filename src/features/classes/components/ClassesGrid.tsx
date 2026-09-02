import type { JSX } from "react";

import { Link } from "react-router-dom";

import { ArrowRight, BookOpen, Layers3, Users } from "lucide-react";

import { classDetail } from "@constants/routes.constants";

import { Stagger, StaggerItem } from "@/components/common/Motion";
import { Spinner } from "@/components/ui/spinner";

import type { SchoolClass } from "../types/class.types";

import { CreateClassCard } from "./CreateClassCard";

interface ClassesGridProps {
    classes: SchoolClass[];
    isLoading: boolean;
    isCreating: boolean;
    createAcademicYearId: string;
    createAcademicYearName: string;
    canCreate: boolean;
    isCreateSubmitting: boolean;
    subjectCountByClass: Record<number, number>;
    subjectsLoading: boolean;
    onStartCreate: () => void;
    onCancelCreate: () => void;
    onCreateSubmit: (values: {
        name: string;
        gradeLevel: number;
        academicYearId: string;
    }) => Promise<boolean>;
    onOpenSubjects: (classNumber: number) => void;
}

export function ClassesGrid({
    classes,
    isLoading,
    isCreating,
    createAcademicYearId,
    createAcademicYearName,
    canCreate,
    isCreateSubmitting,
    subjectCountByClass,
    subjectsLoading,
    onStartCreate,
    onCancelCreate,
    onCreateSubmit,
    onOpenSubjects,
}: ClassesGridProps): JSX.Element {
    if (isLoading) {
        return (
            <div className="bg-card text-muted-foreground ring-foreground/10 flex items-center justify-center gap-2 rounded-xl py-16 text-sm shadow-sm ring-1">
                <Spinner />
                <span>Loading classes...</span>
            </div>
        );
    }

    return (
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <StaggerItem>
                <CreateClassCard
                    isCreating={isCreating}
                    academicYearId={createAcademicYearId}
                    academicYearName={createAcademicYearName}
                    canCreate={canCreate}
                    isSubmitting={isCreateSubmitting}
                    onStart={onStartCreate}
                    onCancel={onCancelCreate}
                    onSubmit={onCreateSubmit}
                />
            </StaggerItem>

            {Array.from(
                classes.reduce<Map<number, SchoolClass[]>>((groups, section) => {
                    const sections = groups.get(section.gradeLevel) ?? [];
                    sections.push(section);
                    groups.set(section.gradeLevel, sections);
                    return groups;
                }, new Map()),
            )
                .sort(([left], [right]) => left - right)
                .map(([gradeLevel, sections]) => {
                    const enrollment = sections.reduce(
                        (total, section) => total + (section.studentCount ?? 0),
                        0,
                    );
                    const hasEnrollment = sections.some(
                        (section) => section.studentCount !== undefined,
                    );
                    return (
                        <StaggerItem key={gradeLevel}>
                            <article className="border-border/70 bg-card flex min-h-72 w-full flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow duration-200 hover:shadow-md">
                                <header className="border-border/60 from-primary/12 via-primary/5 flex w-full items-center justify-between border-b bg-linear-to-br to-transparent px-5 py-5">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-primary/12 text-primary ring-primary/20 flex size-11 items-center justify-center rounded-xl ring-1">
                                            <Layers3 className="size-5" />
                                        </span>
                                        <div>
                                            <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                                                Class
                                            </p>
                                            <h2 className="text-3xl leading-none font-bold tabular-nums">
                                                {gradeLevel}
                                            </h2>
                                        </div>
                                    </div>
                                    <span className="text-muted-foreground text-right">
                                        <span className="text-foreground block text-xl font-bold tabular-nums">
                                            {sections.length}
                                        </span>
                                        <span className="text-xs">
                                            {sections.length === 1 ? "Section" : "Sections"}
                                        </span>
                                    </span>
                                </header>
                                <div className="flex w-full flex-1 flex-col px-5 py-4">
                                    <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                        Sections
                                    </h3>
                                    <nav
                                        aria-label={`Sections in Class ${gradeLevel}`}
                                        className="relative z-10 mt-3 flex flex-wrap gap-2"
                                    >
                                        {sections.map((section) => (
                                            <Link
                                                key={section.id}
                                                to={classDetail(section.id)}
                                                state={{
                                                    academicYearId: section.academicYearId,
                                                    classNumber: gradeLevel,
                                                }}
                                                className="border-border/70 bg-background hover:border-primary/35 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-ring/40 group/section inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
                                            >
                                                Section {section.name}
                                                <ArrowRight className="text-muted-foreground size-3.5 transition-transform group-hover/section:translate-x-0.5" />
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="border-border/60 mt-auto flex items-center gap-2 border-t pt-4 text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Users className="size-3.5" />
                                            {hasEnrollment
                                                ? `${enrollment} students`
                                                : "Enrollment unavailable"}
                                        </span>
                                        <button
                                            type="button"
                                            className="text-primary hover:bg-primary/8 focus-visible:ring-ring/40 ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 font-semibold focus-visible:ring-3 focus-visible:outline-none"
                                            onClick={() => onOpenSubjects(gradeLevel)}
                                        >
                                            <BookOpen className="size-3.5" />
                                            {subjectsLoading
                                                ? "Subjects…"
                                                : `${subjectCountByClass[gradeLevel] ?? 0} subjects`}
                                            <ArrowRight className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </StaggerItem>
                    );
                })}
        </Stagger>
    );
}
