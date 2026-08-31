import type { JSX } from "react";

import type { FeeStatus } from "@constants/fees.constants";

import { formatCurrency } from "../lib/format";

import { FeeStatusBadge } from "./FeeStatusBadge";

interface FeeSummaryCardProps {
    totalAmount: number;
    amountPaid: number;
    status: FeeStatus;
}

export function FeeSummaryCard({
    totalAmount,
    amountPaid,
    status,
}: FeeSummaryCardProps): JSX.Element {
    const remaining = Math.max(totalAmount - amountPaid, 0);

    return (
        <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
            <div className="border-border/60 from-primary/12 via-primary/5 flex flex-wrap items-center justify-between gap-3 border-b bg-linear-to-br to-transparent px-6 py-4">
                <h2 className="text-sm font-semibold tracking-tight">Fee summary</h2>
                <FeeStatusBadge status={status} />
            </div>
            <div className="grid grid-cols-3 gap-3 px-6 py-5">
                <div>
                    <p className="text-muted-foreground text-xs">Total owed</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {formatCurrency(totalAmount)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Total paid</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {formatCurrency(amountPaid)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-xs">Remaining</p>
                    <p className="text-lg font-semibold tabular-nums">
                        {formatCurrency(remaining)}
                    </p>
                </div>
            </div>
        </div>
    );
}
