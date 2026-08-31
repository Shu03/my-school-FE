import { useState } from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, Plus, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";

import { FEE_STATUS_LABELS, FEE_STATUS_LIST, type FeeStatus } from "@constants/fees.constants";
import { PERMISSIONS } from "@constants/permissions.constants";
import { feeDetail } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { useCurrentAcademicYear } from "@features/academic-years";
import { hasPermission, useAuthStore } from "@features/auth";
import { useClassesList } from "@features/classes";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BackfillDialog } from "../components/BackfillDialog";
import { FeeRecordsTable } from "../components/FeeRecordsTable";
import { FeeStructureFormDialog } from "../components/FeeStructureFormDialog";
import { FeeStructuresTable } from "../components/FeeStructuresTable";
import {
    useBackfillFees,
    useCreateFeeStructure,
    useFeeRecordsList,
    useFeeStructuresList,
    useUpdateFeeStructure,
} from "../hooks/useFees";
import { getFeeErrorMessage } from "../lib/errors";
import type { FeeStructureFormValues } from "../schemas/fee-structure.schema";
import type { BackfillResult, FeeRecord, FeeStructure } from "../types/fee.types";

const ALL = "all";

export function FeesPage(): JSX.Element {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === Role.ADMIN;
    const canManage = isAdmin || hasPermission(user?.permissions, PERMISSIONS.FEES_MANAGE);

    const { data: currentYear } = useCurrentAcademicYear();

    const [classFilter, setClassFilter] = useState<string>(ALL);
    const [statusFilter, setStatusFilter] = useState<string>(ALL);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<FeeStructure | null>(null);
    const [backfillOpen, setBackfillOpen] = useState(false);
    const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null);

    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        isAdmin && Boolean(currentYear?.id),
    );

    const {
        data: records = [],
        isLoading: recordsLoading,
        isError: recordsError,
        refetch: refetchRecords,
    } = useFeeRecordsList({
        classId: isAdmin && classFilter !== ALL ? classFilter : undefined,
        academicYearId: currentYear?.id,
        status: statusFilter === ALL ? undefined : (statusFilter as FeeStatus),
    });

    const {
        data: structures = [],
        isLoading: structuresLoading,
        isError: structuresError,
        refetch: refetchStructures,
    } = useFeeStructuresList({ academicYearId: currentYear?.id }, Boolean(currentYear?.id));

    const createMutation = useCreateFeeStructure();
    const updateMutation = useUpdateFeeStructure();
    const backfillMutation = useBackfillFees();

    function handleView(record: FeeRecord): void {
        navigate(feeDetail(record.id));
    }

    function handleCreate(): void {
        setEditing(null);
        setFormOpen(true);
    }

    function handleEdit(structure: FeeStructure): void {
        setEditing(structure);
        setFormOpen(true);
    }

    function handleOpenBackfill(): void {
        setBackfillResult(null);
        setBackfillOpen(true);
    }

    async function handleFormSubmit(values: FeeStructureFormValues): Promise<void> {
        try {
            if (editing) {
                await updateMutation.mutateAsync({
                    id: editing.id,
                    data: { totalAmount: values.totalAmount, dueDate: values.dueDate },
                });
                toast.success("Fee structure updated successfully.");
            } else {
                await createMutation.mutateAsync({
                    gradeLevel: values.gradeLevel,
                    academicYearId: currentYear?.id,
                    totalAmount: values.totalAmount,
                    dueDate: values.dueDate,
                });
                toast.success("Fee structure created successfully.");
            }

            setFormOpen(false);
            setEditing(null);
        } catch (error) {
            toast.error(getFeeErrorMessage(error));
        }
    }

    async function handleBackfill(): Promise<void> {
        try {
            const result = await backfillMutation.mutateAsync({
                academicYearId: currentYear?.id,
            });
            setBackfillResult(result);
            toast.success("Fee records generated successfully.");
        } catch (error) {
            toast.error(getFeeErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <Wallet className="size-5" />
                        Fees
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Track student fee payments and manage fee structures.
                    </p>
                </div>

                <div className="px-6 py-6">
                    <Tabs defaultValue="records">
                        <TabsList>
                            <TabsTrigger value="records">Records</TabsTrigger>
                            <TabsTrigger value="structures">Structures</TabsTrigger>
                        </TabsList>

                        <TabsContent value="records" className="flex flex-col gap-4 pt-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {isAdmin && (
                                    <Select value={classFilter} onValueChange={setClassFilter}>
                                        <SelectTrigger
                                            className="w-52"
                                            aria-label="Filter by class"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ALL}>All classes</SelectItem>
                                            {classes.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} (Grade {item.gradeLevel})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-44" aria-label="Filter by status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>All statuses</SelectItem>
                                        {FEE_STATUS_LIST.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {FEE_STATUS_LABELS[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {recordsError ? (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertDescription className="flex items-center justify-between gap-4">
                                        <span>Could not load fee records. Please try again.</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => void refetchRecords()}
                                        >
                                            Retry
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <FeeRecordsTable
                                    records={records}
                                    isLoading={recordsLoading}
                                    onView={handleView}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="structures" className="flex flex-col gap-4 pt-4">
                            {canManage && (
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    <Button variant="outline" onClick={handleOpenBackfill}>
                                        <Receipt className="size-4" />
                                        Generate records
                                    </Button>
                                    <Button onClick={handleCreate}>
                                        <Plus className="size-4" />
                                        Create structure
                                    </Button>
                                </div>
                            )}

                            {structuresError ? (
                                <Alert variant="destructive">
                                    <AlertCircle />
                                    <AlertDescription className="flex items-center justify-between gap-4">
                                        <span>
                                            Could not load fee structures. Please try again.
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => void refetchStructures()}
                                        >
                                            Retry
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <FeeStructuresTable
                                    structures={structures}
                                    isLoading={structuresLoading}
                                    canManage={canManage}
                                    onEdit={handleEdit}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <FeeStructureFormDialog
                open={formOpen}
                structure={editing}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />

            <BackfillDialog
                open={backfillOpen}
                isSubmitting={backfillMutation.isPending}
                result={backfillResult}
                onOpenChange={setBackfillOpen}
                onConfirm={handleBackfill}
            />
        </div>
    );
}
