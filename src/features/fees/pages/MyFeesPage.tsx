import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import { AlertCircle, Wallet } from "lucide-react";

import { feeDetail } from "@constants/routes.constants";

import { useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

import { FeeRecordsTable } from "../components/FeeRecordsTable";
import { useStudentFeeHistory } from "../hooks/useFees";
import type { FeeRecord } from "../types/fee.types";

export function MyFeesPage(): JSX.Element {
    const navigate = useNavigate();
    const studentProfileId = useAuthStore((s) => s.user?.studentProfileId ?? null);

    const { data: records = [], isLoading, isError } = useStudentFeeHistory(studentProfileId);

    function handleView(record: FeeRecord): void {
        navigate(feeDetail(record.id));
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <Wallet className="size-5" />
                        My fees
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        View your fee records and payment status.
                    </p>
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    {!studentProfileId ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>
                                No student profile is linked to your account.
                            </AlertDescription>
                        </Alert>
                    ) : isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>Could not load your fees.</AlertDescription>
                        </Alert>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-10">
                            <Spinner />
                            <span className="text-muted-foreground text-sm">
                                Loading your fees...
                            </span>
                        </div>
                    ) : (
                        <FeeRecordsTable records={records} isLoading={false} onView={handleView} />
                    )}
                </div>
            </div>
        </div>
    );
}
