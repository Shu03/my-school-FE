import { useEffect, useState } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, ArrowUpNarrowWide, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { studentDetail } from "@constants/routes.constants";
import { STUDENT_PAGINATION } from "@constants/students.constants";

import { Role } from "@/types/api";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { PromoteStudentsDialog } from "../components/PromoteStudentsDialog";
import { StudentsPagination } from "../components/StudentsPagination";
import { StudentsTable } from "../components/StudentsTable";
import { usePromoteStudents, useStudentsList } from "../hooks/useStudents";
import { getStudentErrorMessage } from "../lib/errors";
import type { StudentProfile, StudentsListParams } from "../types/student.types";

const SEARCH_DEBOUNCE_MS = 350;
const ALL_CLASSES = "all";

export function StudentsPage(): JSX.Element {
    const navigate = useNavigate();

    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;

    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [classFilter, setClassFilter] = useState<string>(ALL_CLASSES);
    const [page, setPage] = useState<number>(STUDENT_PAGINATION.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(STUDENT_PAGINATION.DEFAULT_LIMIT);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [promoteOpen, setPromoteOpen] = useState(false);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    const promoteMutation = usePromoteStudents();

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(handle);
    }, [searchInput]);

    function handleClassChange(value: string): void {
        setClassFilter(value);
        setPage(1);
        setSelectedIds([]);
    }

    function handleLimitChange(value: number): void {
        setLimit(value);
        setPage(1);
    }

    const params: StudentsListParams = {
        page,
        limit,
        search: debouncedSearch || undefined,
        classId: classFilter === ALL_CLASSES ? undefined : classFilter,
    };

    const { data, isLoading, isError, refetch } = useStudentsList(params);
    const students = data?.data ?? [];
    const total = data?.total ?? 0;

    function handleView(student: StudentProfile): void {
        navigate(studentDetail(student.id));
    }

    function handleToggleSelect(id: string): void {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
    }

    function handleToggleSelectAll(): void {
        setSelectedIds((current) =>
            current.length === students.length ? [] : students.map((student) => student.id),
        );
    }

    async function handlePromote(targetClassId: string): Promise<void> {
        try {
            const result = await promoteMutation.mutateAsync({
                studentIds: selectedIds,
                targetClassId,
                academicYearId: currentYear?.id,
            });

            toast.success(
                `Promoted ${result.promoted} ${result.promoted === 1 ? "student" : "students"}.` +
                    (result.skipped.length > 0 ? ` Skipped ${result.skipped.length}.` : ""),
            );
            setPromoteOpen(false);
            setSelectedIds([]);
        } catch (error) {
            toast.error(getStudentErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                                <GraduationCap className="size-5" />
                                Students
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Manage student profiles, enrollments, and promotions.
                            </p>
                        </div>
                        {isAdmin && (
                            <Button
                                disabled={selectedIds.length === 0}
                                onClick={() => setPromoteOpen(true)}
                            >
                                <ArrowUpNarrowWide className="size-4" />
                                Promote ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            type="search"
                            placeholder="Search by name or admission no."
                            className="w-64"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                        />
                        <Select value={classFilter} onValueChange={handleClassChange}>
                            <SelectTrigger className="w-52" aria-label="Filter by class">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_CLASSES}>All classes</SelectItem>
                                {classes.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name} (Grade {item.gradeLevel})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>Could not load students. Please try again.</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void refetch()}
                                >
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <StudentsTable
                                students={students}
                                isLoading={isLoading}
                                selectable={isAdmin}
                                selectedIds={selectedIds}
                                onToggleSelect={handleToggleSelect}
                                onToggleSelectAll={handleToggleSelectAll}
                                onView={handleView}
                            />
                            <StudentsPagination
                                page={page}
                                limit={limit}
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={handleLimitChange}
                            />
                        </>
                    )}
                </div>
            </div>

            <PromoteStudentsDialog
                open={promoteOpen}
                selectedCount={selectedIds.length}
                isSubmitting={promoteMutation.isPending}
                onOpenChange={setPromoteOpen}
                onSubmit={handlePromote}
            />
        </div>
    );
}
