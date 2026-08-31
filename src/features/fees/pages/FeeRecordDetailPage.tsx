import { useState } from "react";
import type { JSX } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { PERMISSIONS } from "@constants/permissions.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import { hasPermission, useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { FeeSummaryCard } from "../components/FeeSummaryCard";
import { PaymentHistoryTable } from "../components/PaymentHistoryTable";
import { RecordPaymentDialog } from "../components/RecordPaymentDialog";
import { useFeeRecord, useRecordPayment } from "../hooks/useFees";
import { getFeeErrorMessage } from "../lib/errors";
import { printFeeReceipt } from "../lib/receipt";
import type { PaymentFormValues } from "../schemas/payment.schema";

export function FeeRecordDetailPage(): JSX.Element {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const isAdmin = user?.role === Role.ADMIN;
    const isStudent = user?.role === Role.STUDENT;
    const canRecordPayment =
        !isStudent && (isAdmin || hasPermission(user?.permissions, PERMISSIONS.FEES_MANAGE));

    const [paymentOpen, setPaymentOpen] = useState(false);

    const { data: record, isLoading, isError } = useFeeRecord(id || null);
    const recordPaymentMutation = useRecordPayment(id);

    async function handleRecordPayment(values: PaymentFormValues): Promise<void> {
        try {
            await recordPaymentMutation.mutateAsync({
                amount: values.amount,
                paidOn: values.paidOn,
                note: values.note ? values.note : undefined,
            });
            toast.success("Payment recorded successfully.");
            setPaymentOpen(false);
        } catch (error) {
            toast.error(getFeeErrorMessage(error));
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading fee record...</span>
            </div>
        );
    }

    if (isError || !record) {
        return (
            <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>Could not load this fee record.</AlertDescription>
            </Alert>
        );
    }

    const studentName = `${record.student.user.firstName} ${record.student.user.lastName}`;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-3"
                    onClick={() => navigate(ROUTES.FEES)}
                >
                    <ArrowLeft className="size-4" />
                    Back to fee records
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">{studentName}</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {record.student.admissionNumber} · Grade{" "}
                            {record.feeStructure.gradeLevel}
                        </p>
                    </div>
                    {canRecordPayment && (
                        <Button onClick={() => setPaymentOpen(true)}>
                            <Plus className="size-4" />
                            Record payment
                        </Button>
                    )}
                </div>
            </div>

            <FeeSummaryCard
                totalAmount={record.totalAmount}
                amountPaid={record.amountPaid}
                status={record.status}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Payment history</CardTitle>
                </CardHeader>
                <CardContent>
                    <PaymentHistoryTable
                        payments={record.payments}
                        isLoading={false}
                        onPrintReceipt={(payment) => printFeeReceipt(record, payment)}
                    />
                </CardContent>
            </Card>

            {canRecordPayment && (
                <RecordPaymentDialog
                    open={paymentOpen}
                    isSubmitting={recordPaymentMutation.isPending}
                    onOpenChange={setPaymentOpen}
                    onSubmit={handleRecordPayment}
                />
            )}
        </div>
    );
}
