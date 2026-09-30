import type { JSX } from "react";

import { AlertCircle, Plus } from "lucide-react";

import { ACCOUNT_PAGINATION } from "@constants/accounts.constants";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useAccountActions } from "../hooks/useAccountActions";
import { useBillsList } from "../hooks/useAccounts";
import { getAccountsErrorMessage } from "../lib/errors";
import {
    formatDateOnly,
    formatMoney,
    fromPaise,
    parseMoney,
    toDateOnly,
    toPaise,
} from "../lib/format";
import { getCategoryIcon } from "../lib/visuals";
import type { Bill, Withdrawal } from "../types/account.types";

import { RowActions } from "./LedgerParts";

const rowGrid =
    "grid grid-cols-[1.75rem_minmax(0,1fr)_auto_4.5rem] items-center gap-x-3 @md:grid-cols-[1.75rem_minmax(0,1fr)_auto_7.5rem_4.5rem]";

/** Rail node marking each line of the statement. */
function Node({ tone }: { tone: "cash" | "bill" | "balance" }): JSX.Element {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "absolute top-1/2 -left-[calc(1.8125rem+1px)] size-2.5 -translate-y-1/2 rounded-full ring-4 ring-[color:var(--statement-bg,var(--card))]",
                tone === "cash" && "bg-chart-1",
                tone === "bill" && "bg-card border-muted-foreground/50 border-2",
                tone === "balance" && "bg-card border-chart-1 border-2",
            )}
        />
    );
}

function sortBills(bills: Bill[]): Bill[] {
    return [...bills].sort(
        (a, b) =>
            toDateOnly(a.billedOn).localeCompare(toDateOnly(b.billedOn)) ||
            a.createdAt.localeCompare(b.createdAt),
    );
}

interface WithdrawalStatementProps {
    withdrawal: Withdrawal;
    /** Hide when the surrounding view already has a prominent add button. */
    showAddBill?: boolean;
    className?: string;
}

/**
 * A passbook for one withdrawal: the cash taken out, each bill paid from it with the
 * balance after it, and what is still in hand — the bill ↔ withdrawal link made literal.
 */
export function WithdrawalStatement({
    withdrawal,
    showAddBill = true,
    className,
}: WithdrawalStatementProps): JSX.Element {
    const actions = useAccountActions();
    const { data, error, isLoading, isError } = useBillsList({
        withdrawalId: withdrawal.id,
        page: 1,
        limit: ACCOUNT_PAGINATION.MAX_LIMIT,
    });

    const bills = sortBills(data?.data ?? []);
    // A running balance is only honest when every bill is on screen.
    const showRunning = data !== undefined && data.total === bills.length;
    const hasCashLeft = parseMoney(withdrawal.remaining) > 0;
    const startPaise = toPaise(parseMoney(withdrawal.amount));
    const balancesAfter = bills.reduce<number[]>((acc, bill) => {
        const previous = acc.length > 0 ? acc[acc.length - 1] : startPaise;
        return [...acc, previous - toPaise(parseMoney(bill.amount))];
    }, []);

    return (
        <div className={cn("@container", className)}>
            <div className="border-chart-1/50 relative ml-3.5 border-l-2 border-dashed pl-6">
                <div className={cn(rowGrid, "relative py-2")}>
                    <Node tone="cash" />
                    <span className="text-muted-foreground col-span-2 text-xs font-semibold tracking-[0.12em] uppercase">
                        Withdrawn {formatDateOnly(withdrawal.withdrawnOn)}
                        {withdrawal.withdrawnBy && (
                            <span className="font-normal tracking-normal normal-case">
                                {" "}
                                · by {withdrawal.withdrawnBy}
                            </span>
                        )}
                    </span>
                    <span className="text-right text-sm font-semibold tabular-nums @md:col-start-4">
                        {formatMoney(withdrawal.amount)}
                    </span>
                </div>

                {isLoading && (
                    <div className="text-muted-foreground relative flex items-center gap-2 py-3 text-sm">
                        <Spinner className="size-3.5" />
                        Loading bills...
                    </div>
                )}

                {isError && (
                    <p className="text-destructive relative flex items-center gap-2 py-3 text-sm">
                        <AlertCircle className="size-4" />
                        {getAccountsErrorMessage(error)}
                    </p>
                )}

                {!isLoading && !isError && bills.length === 0 && (
                    <p className="text-muted-foreground relative py-3 text-sm">
                        <Node tone="bill" />
                        No bills recorded against this cash yet.
                    </p>
                )}

                {bills.map((bill, index) => {
                    const Icon = getCategoryIcon(bill.category);
                    const detail = [bill.vendor, bill.billNumber && `#${bill.billNumber}`]
                        .filter(Boolean)
                        .join(" · ");

                    return (
                        <div key={bill.id} className={cn(rowGrid, "group/bill relative py-1.5")}>
                            <Node tone="bill" />
                            <span className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-lg">
                                <Icon className="size-3.5" />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">
                                    {bill.category}
                                    {detail && (
                                        <span className="text-muted-foreground font-normal">
                                            {" "}
                                            · {detail}
                                        </span>
                                    )}
                                </span>
                                <span className="text-muted-foreground block text-xs tabular-nums">
                                    {formatDateOnly(bill.billedOn)}
                                </span>
                            </span>
                            <span className="text-right text-sm font-semibold tabular-nums">
                                −{formatMoney(bill.amount)}
                            </span>
                            <span className="text-muted-foreground hidden text-right text-xs tabular-nums @md:block">
                                {showRunning && (
                                    <>
                                        <span className="sr-only">Balance after this bill: </span>
                                        {formatMoney(fromPaise(balancesAfter[index]))}
                                    </>
                                )}
                            </span>
                            <span className="transition-opacity focus-within:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover/bill:opacity-100">
                                <RowActions
                                    label={`${bill.category} bill of ${formatMoney(bill.amount)}`}
                                    isDeleting={actions.deletingId === bill.id}
                                    onEdit={() => actions.editBill(bill)}
                                    onDelete={() => actions.deleteBill(bill)}
                                />
                            </span>
                        </div>
                    );
                })}

                {data && data.total > bills.length && (
                    <p className="text-muted-foreground relative py-1 text-xs">
                        Showing the first {bills.length} of {data.total} bills.
                    </p>
                )}

                <div
                    className={cn(
                        rowGrid,
                        "border-border/60 relative mt-1 border-t border-dashed pt-2.5",
                    )}
                >
                    <Node tone="balance" />
                    <span className="col-span-2 flex items-center gap-3">
                        <span className="text-sm font-semibold">
                            {hasCashLeft ? "Still in hand" : "Fully billed"}
                        </span>
                        {hasCashLeft && showAddBill && (
                            <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                className="bg-card"
                                onClick={() => actions.addBill(withdrawal.id)}
                            >
                                <Plus className="size-3" />
                                Add bill
                            </Button>
                        )}
                    </span>
                    <span
                        className={cn(
                            "text-right text-base font-bold tabular-nums @md:col-start-4",
                            !hasCashLeft && "text-muted-foreground",
                        )}
                    >
                        {formatMoney(withdrawal.remaining)}
                    </span>
                </div>
            </div>
        </div>
    );
}
