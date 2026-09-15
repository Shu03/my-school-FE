import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

import { feeDetail } from "@constants/routes.constants";

import { useProfile } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

import { FeeRecordsTable } from "../components/FeeRecordsTable";
import { useStudentFeeHistory } from "../hooks/useFees";
import { getFeeErrorMessage } from "../lib/errors";
import { formatCurrency } from "../lib/format";
import type { FeeRecord } from "../types/fee.types";

export function MyFeesPage(): JSX.Element {
    const navigate = useNavigate();
    const { data: profile, isLoading: studentLoading } = useProfile();
    const studentProfileId = profile?.studentProfile?.id ?? null;

    const {
        data: records = [],
        error,
        isLoading,
        isError,
    } = useStudentFeeHistory(studentProfileId);

    const totalAmount = records.reduce((sum, record) => sum + record.totalAmount, 0);
    const amountPaid = records.reduce((sum, record) => sum + record.amountPaid, 0);
    const balance = Math.max(totalAmount - amountPaid, 0);
    const paidPercentage = totalAmount > 0 ? Math.min((amountPaid / totalAmount) * 100, 100) : 0;
    const hasFeeRecords = Boolean(studentProfileId && !studentLoading && !isLoading && !isError);
    const isPaid = hasFeeRecords && records.length > 0 && balance <= 0;
    const hasPartialPayment = hasFeeRecords && amountPaid > 0 && !isPaid;
    const statusClassName = isPaid
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : hasPartialPayment
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-red-200 bg-red-50 text-red-700";

    function handleView(record: FeeRecord): void {
        navigate(feeDetail(record.id));
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        {hasFeeRecords ? (
                            <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                                        Balance due
                                    </p>
                                    <p className="text-primary mt-1 text-3xl font-bold tracking-tight tabular-nums">
                                        {formatCurrency(balance)}
                                    </p>
                                </div>
                                <div
                                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${statusClassName}`}
                                >
                                    {isPaid ? (
                                        <CheckCircle2 className="size-4" />
                                    ) : (
                                        <Clock3 className="size-4" />
                                    )}
                                    <span>Balance due {formatCurrency(balance)}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm lg:max-w-xs lg:text-right">
                                {studentLoading || (studentProfileId && isLoading)
                                    ? "Loading your live fee balance..."
                                    : isError
                                      ? "Your fee balance is temporarily unavailable."
                                      : !studentProfileId
                                        ? "A linked student profile is required to show fees."
                                        : "No fee records are available yet."}
                            </p>
                        )}
                    </div>

                    {hasFeeRecords && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                                    <span className="text-muted-foreground tabular-nums">
                                        {formatCurrency(amountPaid)} paid of{" "}
                                        {formatCurrency(totalAmount)}
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {paidPercentage.toFixed(0)}% paid
                                    </span>
                                </div>
                                <div
                                    className="bg-background/70 h-2.5 overflow-hidden rounded-full"
                                    role="progressbar"
                                    aria-label="Fee payment progress"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={paidPercentage}
                                >
                                    <div
                                        className="bg-primary h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                                        style={{ width: `${paidPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    {studentLoading ? (
                        <div className="flex items-center justify-center gap-2 py-10">
                            <Spinner />
                            <span className="text-muted-foreground text-sm">
                                Loading your student profile...
                            </span>
                        </div>
                    ) : !studentProfileId ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>
                                No student profile is linked to your account.
                            </AlertDescription>
                        </Alert>
                    ) : isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>{getFeeErrorMessage(error)}</AlertDescription>
                        </Alert>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-10">
                            <Spinner />
                            <span className="text-muted-foreground text-sm">
                                Loading your fees...
                            </span>
                        </div>
                    ) : (
                        <>
                            <FeeRecordsTable
                                records={records}
                                isLoading={false}
                                onView={handleView}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
