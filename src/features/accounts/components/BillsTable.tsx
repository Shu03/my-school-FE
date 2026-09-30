import type { JSX } from "react";

import { Plus, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";

import { useAccountActions } from "../hooks/useAccountActions";
import { formatDateOnly, formatMoney, formatWithdrawalLabel } from "../lib/format";
import { getCategoryIcon } from "../lib/visuals";
import type { Bill, Withdrawal } from "../types/account.types";

import {
    LedgerEmpty,
    LedgerTable,
    NoteText,
    RecordedBy,
    RowActions,
    UsageRing,
} from "./LedgerParts";

interface BillsTableProps {
    bills: Bill[];
    withdrawalsById: Map<string, Withdrawal>;
    showWithdrawal: boolean;
    isLoading: boolean;
    isRefreshing: boolean;
    isFiltered: boolean;
}

export function BillsTable({
    bills,
    withdrawalsById,
    showWithdrawal,
    isLoading,
    isRefreshing,
    isFiltered,
}: BillsTableProps): JSX.Element {
    const actions = useAccountActions();

    return (
        <LedgerTable
            columnCount={showWithdrawal ? 8 : 7}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            isEmpty={bills.length === 0}
            loadingLabel="Loading bills..."
            head={
                <>
                    <TableHead className="w-36">Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {showWithdrawal && <TableHead>Paid from</TableHead>}
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
                        icon={Receipt}
                        title="No bills match"
                        description="Nothing was billed here. Widen the dates or clear the filters."
                    />
                ) : (
                    <LedgerEmpty
                        icon={Receipt}
                        title="No bills yet"
                        description="Bills record what withdrawn cash was spent on — petrol, food, repairs and so on."
                        action={
                            <Button size="sm" onClick={() => actions.addBill()}>
                                <Plus className="size-4" />
                                Add bill
                            </Button>
                        }
                    />
                )
            }
        >
            {bills.map((bill) => {
                const CategoryIcon = getCategoryIcon(bill.category);
                const withdrawal = withdrawalsById.get(bill.withdrawalId);

                return (
                    <TableRow key={bill.id}>
                        <TableCell className="font-medium tabular-nums">
                            {formatDateOnly(bill.billedOn)}
                        </TableCell>
                        <TableCell>
                            <span className="flex items-center gap-2">
                                <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
                                    <CategoryIcon className="size-3.5" />
                                </span>
                                <span className="font-medium">{bill.category}</span>
                            </span>
                        </TableCell>
                        <TableCell>
                            {bill.vendor || bill.billNumber ? (
                                <span className="flex flex-col">
                                    <span>{bill.vendor ?? "—"}</span>
                                    {bill.billNumber && (
                                        <span className="text-muted-foreground text-xs">
                                            Bill #{bill.billNumber}
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                            −{formatMoney(bill.amount)}
                        </TableCell>
                        {showWithdrawal && (
                            <TableCell>
                                <button
                                    type="button"
                                    className="border-border/70 hover:border-primary/40 hover:bg-primary/[0.05] focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-1 text-xs font-medium whitespace-nowrap tabular-nums transition-colors outline-none focus-visible:ring-3"
                                    title="Show only bills paid from this withdrawal"
                                    onClick={() => actions.showBillsFor(bill.withdrawalId)}
                                >
                                    {withdrawal ? (
                                        <>
                                            <UsageRing
                                                amount={withdrawal.amount}
                                                spent={withdrawal.spent}
                                                size={16}
                                            />
                                            {formatWithdrawalLabel(withdrawal)}
                                        </>
                                    ) : (
                                        <span className="pl-1.5">Earlier withdrawal</span>
                                    )}
                                </button>
                            </TableCell>
                        )}
                        <TableCell>
                            <NoteText note={bill.note} />
                        </TableCell>
                        <TableCell>
                            <RecordedBy user={bill.recordedBy} />
                        </TableCell>
                        <TableCell>
                            <RowActions
                                label={`${bill.category} bill of ${formatMoney(bill.amount)}`}
                                isDeleting={actions.deletingId === bill.id}
                                onEdit={() => actions.editBill(bill)}
                                onDelete={() => actions.deleteBill(bill)}
                            />
                        </TableCell>
                    </TableRow>
                );
            })}
        </LedgerTable>
    );
}
