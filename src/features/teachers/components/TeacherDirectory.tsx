import { useDeferredValue, useMemo, useState, type JSX } from "react";

import { CalendarDays, Mail, Phone, Search, ShieldCheck, UserRoundSearch, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { PermissionPreset, TeacherProfile } from "../types/teacher.types";

interface TeacherDirectoryProps {
    teachers: TeacherProfile[];
    presets: PermissionPreset[];
    isLoading: boolean;
    selectedTeacherId: string | null;
    onSelect: (teacher: TeacherProfile) => void;
}

type StatusFilter = "all" | "active" | "inactive";

function getInitials(teacher: TeacherProfile): string {
    return `${teacher.user.firstName.charAt(0)}${teacher.user.lastName.charAt(0)}`.toUpperCase();
}

export function TeacherDirectory({
    teachers,
    presets,
    isLoading,
    selectedTeacherId,
    onSelect,
}: TeacherDirectoryProps): JSX.Element {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [presetId, setPresetId] = useState("all");
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());

    const filteredTeachers = useMemo(
        () =>
            teachers.filter((teacher) => {
                const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`.toLowerCase();
                const matchesSearch =
                    !deferredSearch ||
                    fullName.includes(deferredSearch) ||
                    teacher.employeeCode.toLowerCase().includes(deferredSearch);
                const matchesStatus =
                    status === "all" || teacher.user.isActive === (status === "active");
                const matchesPreset =
                    presetId === "all" ||
                    (presetId === "none" ? !teacher.presetId : teacher.presetId === presetId);

                return matchesSearch && matchesStatus && matchesPreset;
            }),
        [deferredSearch, presetId, status, teachers],
    );

    const hasFilters = Boolean(search) || status !== "all" || presetId !== "all";

    function clearFilters(): void {
        setSearch("");
        setStatus("all");
        setPresetId("all");
    }

    return (
        <section
            aria-labelledby="teacher-directory-heading"
            className="flex min-w-0 flex-col gap-4"
        >
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 id="teacher-directory-heading" className="text-base font-semibold">
                            Faculty directory
                        </h2>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            {isLoading
                                ? "Loading teacher profiles"
                                : `${filteredTeachers.length} of ${teachers.length} teachers`}
                        </p>
                    </div>
                    {hasFilters ? (
                        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                            <X />
                            Clear filters
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_10rem_12rem]">
                    <label className="relative sm:col-span-2 xl:col-span-1">
                        <span className="sr-only">Search teachers</span>
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name or employee code"
                            className="pl-9"
                        />
                    </label>
                    <Select
                        value={status}
                        onValueChange={(value) => setStatus(value as StatusFilter)}
                    >
                        <SelectTrigger className="w-full" aria-label="Filter by status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={presetId} onValueChange={setPresetId}>
                        <SelectTrigger className="w-full" aria-label="Filter by permission preset">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All presets</SelectItem>
                            <SelectItem value="none">No preset</SelectItem>
                            {presets.map((preset) => (
                                <SelectItem key={preset.id} value={preset.id}>
                                    {preset.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div
                    className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3"
                    aria-label="Loading teachers"
                >
                    {Array.from({ length: 6 }, (_, index) => (
                        <div
                            key={index}
                            className="border-border/60 bg-muted/25 h-52 animate-pulse rounded-xl border motion-reduce:animate-none"
                        />
                    ))}
                </div>
            ) : null}

            {!isLoading && filteredTeachers.length === 0 ? (
                <div className="border-border/70 bg-muted/20 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
                    <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                        <UserRoundSearch className="size-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">
                        {hasFilters ? "No matching teachers" : "No teachers yet"}
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                        {hasFilters
                            ? "Try a different name, employee code, status, or permission preset."
                            : "Teacher profiles will appear here after accounts are created."}
                    </p>
                    {hasFilters ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={clearFilters}
                        >
                            Clear filters
                        </Button>
                    ) : null}
                </div>
            ) : null}

            {!isLoading && filteredTeachers.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                    {filteredTeachers.map((teacher) => {
                        const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`;
                        const selected = teacher.id === selectedTeacherId;

                        return (
                            <button
                                key={teacher.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => onSelect(teacher)}
                                className={cn(
                                    "group focus-visible:border-ring focus-visible:ring-ring/40 relative min-h-52 overflow-hidden rounded-xl border p-4 text-left shadow-xs transition-all duration-200 outline-none focus-visible:ring-3 motion-reduce:transition-none",
                                    selected
                                        ? "border-primary/35 bg-primary/5 shadow-sm"
                                        : "border-border/70 bg-card hover:border-primary/25 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0",
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "bg-primary absolute inset-y-3 left-0 w-1 rounded-r-full transition-transform duration-200 motion-reduce:transition-none",
                                        selected
                                            ? "scale-y-100"
                                            : "scale-y-0 group-hover:scale-y-50",
                                    )}
                                />
                                <div className="flex items-start gap-3">
                                    <span className="texture-sheen bg-primary/12 text-primary ring-primary/20 flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1">
                                        {getInitials(teacher)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold">
                                            {fullName}
                                        </span>
                                        <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                                            {teacher.employeeCode}
                                        </span>
                                    </span>
                                    <Badge
                                        variant={teacher.user.isActive ? "success" : "secondary"}
                                    >
                                        {teacher.user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                <span className="border-border/60 mt-4 grid gap-2 border-t pt-3 text-xs">
                                    <span className="flex min-w-0 items-center gap-2">
                                        <Phone className="text-muted-foreground size-3.5 shrink-0" />
                                        <span className="truncate font-medium">
                                            {teacher.user.mobileNumber}
                                        </span>
                                    </span>
                                    <span className="flex min-w-0 items-center gap-2">
                                        <Mail className="text-muted-foreground size-3.5 shrink-0" />
                                        <span className="truncate font-medium">
                                            {teacher.user.email ?? "Email not provided"}
                                        </span>
                                    </span>
                                    <span className="flex min-w-0 items-center gap-2">
                                        <ShieldCheck className="text-muted-foreground size-3.5 shrink-0" />
                                        <span className="text-muted-foreground">Preset</span>
                                        <span className="ml-auto max-w-[55%] truncate font-medium">
                                            {teacher.preset?.name ?? "Not assigned"}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="text-muted-foreground size-3.5 shrink-0" />
                                        <span className="text-muted-foreground">Joined</span>
                                        <span className="ml-auto font-medium">
                                            {teacher.joiningDate
                                                ? new Date(teacher.joiningDate).toLocaleDateString()
                                                : "Not recorded"}
                                        </span>
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
}
