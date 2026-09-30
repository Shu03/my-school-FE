import { Fragment, useState } from "react";
import type { JSX } from "react";

import { ChevronDown, HandCoins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { useAccountActions } from "../hooks/useAccountActions";
import { formatDateOnly, formatMoney, parseMoney } from "../lib/format";
import type { Withdrawal } from "../types/account.types";

import {
    LedgerEmpty,
    LedgerTable,
    NoteText,
    RecordedBy,
    RowActions,
    SpendMeter,
} from "./LedgerParts";
import { WithdrawalStatement } from "./WithdrawalStatement";

const COLUMN_COUNT = 9;

interface WithdrawalsTableProps {
    withdrawals: Withdrawal[];
    isLoading: boolean;
    isRefreshing: boolean;
    isFiltered: boolean;
}

export function WithdrawalsTable({
    withdrawals,
    isLoading,
    isRefreshing,
    isFiltered,
}: WithdrawalsTableProps): JSX.Element {
    const actions = useAccountActions();
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

    function toggle(id: string): void {
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    return (
        <LedgerTable
            columnCount={COLUMN_COUNT}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            isEmpty={withdrawals.length === 0}
            loadingLabel="Loading withdrawals..."
            head={
                <>
                    <TableHead className="w-10">
                        <span className="sr-only">Bills</span>
                    </TableHead>
                    <TableHead className="w-32">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Withdrawn by</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="w-36 text-right">Remaining</TableHead>
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
                        icon={HandCoins}
                        title="No withdrawals in these dates"
                        description="Widen the date range or show all dates."
                    />
                ) : (
                    <LedgerEmpty
                        icon={HandCoins}
                        title="No cash withdrawn yet"
                        description="Withdraw cash from the bank, then record the bills paid with it."
                        action={
                            <Button size="sm" onClick={actions.addWithdrawal}>
                                <HandCoins className="size-4" />
                                Withdraw cash
                            </Button>
                        }
                    />
                )
            }
        >
            {withdrawals.map((withdrawal) => {
                const isOpen = expanded.has(withdrawal.id);
                const isSettled = parseMoney(withdrawal.remaining) <= 0;
                const label = `withdrawal of ${formatMoney(withdrawal.amount)} on ${formatDateOnly(withdrawal.withdrawnOn)}`;
                const statementId = `statement-${withdrawal.id}`;

                return (
                    <Fragment key={withdrawal.id}>
                        <TableRow
                            data-state={isOpen ? "open" : "closed"}
                            className={cn(
                                "group cursor-pointer",
                                isOpen && "bg-muted/40 hover:bg-muted/40 border-b-0",
                            )}
                            onClick={() => toggle(withdrawal.id)}
                        >
                            <TableCell>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-expanded={isOpen}
                                    aria-controls={statementId}
                                    aria-label={`${isOpen ? "Hide" : "Show"} bills for ${label}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        toggle(withdrawal.id);
                                    }}
                                >
                                    <ChevronDown
                                        className={cn(
                                            "size-4 transition-transform duration-200 motion-reduce:transition-none",
                                            !isOpen && "-rotate-90",
                                        )}
                                    />
                                </Button>
                            </TableCell>
                            <TableCell className="font-medium tabular-nums">
                                {formatDateOnly(withdrawal.withdrawnOn)}
                            </TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">
                                {formatMoney(withdrawal.amount)}
                            </TableCell>
                            <TableCell>
                                {withdrawal.withdrawnBy ?? (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-right tabular-nums">
                                {formatMoney(withdrawal.spent)}
                            </TableCell>
                            <TableCell>
                                <div className="ml-auto flex w-28 flex-col items-end gap-1.5">
                                    {isSettled ? (
                                        <span className="text-muted-foreground text-xs font-medium">
                                            Fully billed
                                        </span>
                                    ) : (
                                        <span className="font-semibold tabular-nums">
                                            {formatMoney(withdrawal.remaining)}
                                        </span>
                                    )}
                                    <SpendMeter
                                        amount={withdrawal.amount}
                                        spent={withdrawal.spent}
                                    />
                                </div>
                            </TableCell>
                            <TableCell>
                                <NoteText note={withdrawal.note} />
                            </TableCell>
                            <TableCell>
                                <RecordedBy user={withdrawal.recordedBy} />
                            </TableCell>
                            <TableCell>
                                <RowActions
                                    label={label}
                                    isDeleting={actions.deletingId === withdrawal.id}
                                    onEdit={() => actions.editWithdrawal(withdrawal)}
                                    onDelete={() => actions.deleteWithdrawal(withdrawal)}
                                />
                            </TableCell>
                        </TableRow>

                        {isOpen && (
                            <TableRow
                                id={statementId}
                                className="bg-muted/40 hover:bg-muted/40 [--statement-bg:color-mix(in_oklch,var(--muted)_40%,var(--card))]"
                            >
                                <TableCell colSpan={COLUMN_COUNT} className="whitespace-normal">
                                    <WithdrawalStatement
                                        withdrawal={withdrawal}
                                        className="mr-2 mb-2 max-w-3xl"
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </Fragment>
                );
            })}
        </LedgerTable>
    );
}
