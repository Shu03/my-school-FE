import type { JSX } from "react";

import { ArrowDownToLine, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";

import { useAccountActions } from "../hooks/useAccountActions";
import { formatDateOnly, formatMoney } from "../lib/format";
import type { Deposit } from "../types/account.types";

import { LedgerEmpty, LedgerTable, NoteText, RecordedBy, RowActions } from "./LedgerParts";

interface DepositsTableProps {
    deposits: Deposit[];
    isLoading: boolean;
    isRefreshing: boolean;
    isFiltered: boolean;
}

export function DepositsTable({
    deposits,
    isLoading,
    isRefreshing,
    isFiltered,
}: DepositsTableProps): JSX.Element {
    const actions = useAccountActions();

    return (
        <LedgerTable
            columnCount={5}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            isEmpty={deposits.length === 0}
            loadingLabel="Loading deposits..."
            head={
                <>
                    <TableHead className="w-36">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Recorded by</TableHead>
                    <TableHead className="w-20">
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </>
            }
            empty={
                isFiltered ? (
                    <LedgerEmpty
                        icon={ArrowDownToLine}
                        title="No deposits in these dates"
                        description="Widen the date range or show all dates."
                    />
                ) : (
                    <LedgerEmpty
                        icon={ArrowDownToLine}
                        title="No deposits yet"
                        description="Deposits build the bank balance. Record the first one to start the ledger."
                        action={
                            <Button size="sm" onClick={actions.addDeposit}>
                                <Plus className="size-4" />
                                Deposit money
                            </Button>
                        }
                    />
                )
            }
        >
            {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                    <TableCell className="font-medium tabular-nums">
                        {formatDateOnly(deposit.depositedOn)}
                    </TableCell>
                    <TableCell className="text-success text-right font-semibold tabular-nums">
                        +{formatMoney(deposit.amount)}
                    </TableCell>
                    <TableCell>
                        <NoteText note={deposit.note} />
                    </TableCell>
                    <TableCell>
                        <RecordedBy user={deposit.recordedBy} />
                    </TableCell>
                    <TableCell>
                        <RowActions
                            label={`deposit of ${formatMoney(deposit.amount)} on ${formatDateOnly(deposit.depositedOn)}`}
                            isDeleting={actions.deletingId === deposit.id}
                            onEdit={() => actions.editDeposit(deposit)}
                            onDelete={() => actions.deleteDeposit(deposit)}
                        />
                    </TableCell>
                </TableRow>
            ))}
        </LedgerTable>
    );
}
