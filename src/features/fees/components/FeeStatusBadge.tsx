import type { JSX } from "react";

import { FEE_STATUS, FEE_STATUS_LABELS, type FeeStatus } from "@constants/fees.constants";

import { Badge } from "@/components/ui/badge";

interface FeeStatusBadgeProps {
    status: FeeStatus;
}

const STATUS_VARIANT: Record<FeeStatus, "destructive" | "warning" | "success"> = {
    [FEE_STATUS.PENDING]: "destructive",
    [FEE_STATUS.PARTIAL]: "warning",
    [FEE_STATUS.PAID]: "success",
};

export function FeeStatusBadge({ status }: FeeStatusBadgeProps): JSX.Element {
    return <Badge variant={STATUS_VARIANT[status]}>{FEE_STATUS_LABELS[status]}</Badge>;
}
