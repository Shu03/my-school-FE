import type { JSX } from "react";

import { ArrowRight, CircleCheck, Plus } from "lucide-react";

import { OPEN_CASH_PREVIEW_LIMIT } from "@constants/accounts.constants";

import { Button } from "@/components/ui/button";

import { useAccountActions } from "../hooks/useAccountActions";
import { useWithdrawalOptions } from "../hooks/useAccounts";
import { daysSince, formatDateOnly, formatMoney, parseMoney, toDateOnly } from "../lib/format";
import type { Withdrawal } from "../types/account.types";

import { AgeChip, SpendMeter } from "./LedgerParts";

/**
 * Withdrawn cash that still has no bills against it — the admin's real to-do list.
 * Oldest first, because cash that has been out longest is the hardest to reconcile.
 */
export function OpenCashSection(): JSX.Element | null {
    const actions = useAccountActions();
    const { data: withdrawals, isLoading } = useWithdrawalOptions();

    if (isLoading) {
        return (
            <div
                className="bg-muted h-40 animate-pulse rounded-xl motion-reduce:animate-none"
                aria-busy="true"
            />
        );
    }

    if (!withdrawals || withdrawals.length === 0) {
        return null;
    }

    const open = withdrawals
        .filter((item) => parseMoney(item.remaining) > 0)
        .sort((a, b) => toDateOnly(a.withdrawnOn).localeCompare(toDateOnly(b.withdrawnOn)));

    if (open.length === 0) {
        return (
            <div className="border-success/25 bg-success/[0.06] flex items-center gap-3 rounded-xl border px-5 py-4">
                <CircleCheck className="text-success size-5 shrink-0" aria-hidden="true" />
                <p className="text-sm">
                    <span className="font-semibold">All withdrawn cash is accounted for.</span>{" "}
                    <span className="text-muted-foreground">
                        Every rupee taken out has a bill against it.
                    </span>
                </p>
            </div>
        );
    }

    const outstanding = open.reduce((sum, item) => sum + parseMoney(item.remaining), 0);
    const preview = open.slice(0, OPEN_CASH_PREVIEW_LIMIT);
    const hiddenCount = open.length - preview.length;

    return (
        <section className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
            <header className="border-border/60 flex flex-wrap items-end justify-between gap-3 border-b px-6 py-4">
                <div>
                    <h2 className="text-base font-semibold tracking-tight">Cash awaiting bills</h2>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                        Withdrawals that still have cash to account for, oldest first.
                    </p>
                </div>
                <p className="text-muted-foreground text-sm">
                    <span className="text-foreground font-semibold tabular-nums">
                        {formatMoney(outstanding)}
                    </span>{" "}
                    across {open.length} {open.length === 1 ? "withdrawal" : "withdrawals"}
                </p>
            </header>

            <ul className="grid gap-3 p-6 sm:grid-cols-2 xl:grid-cols-3">
                {preview.map((withdrawal) => (
                    <OpenCashCard key={withdrawal.id} withdrawal={withdrawal} />
                ))}
            </ul>

            {hiddenCount > 0 && (
                <div className="border-border/60 border-t px-6 py-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="group -ml-2"
                        onClick={actions.showWithdrawals}
                    >
                        {hiddenCount} more in the ledger
                        <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </Button>
                </div>
            )}
        </section>
    );
}

function OpenCashCard({ withdrawal }: { withdrawal: Withdrawal }): JSX.Element {
    const actions = useAccountActions();

    return (
        <li className="group border-border/70 hover:border-primary/35 relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200 hover:shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground min-w-0 truncate text-xs">
                    {formatDateOnly(withdrawal.withdrawnOn)}
                    {withdrawal.withdrawnBy && ` · ${withdrawal.withdrawnBy}`}
                </p>
                <AgeChip days={daysSince(withdrawal.withdrawnOn)} />
            </div>

            <p className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight tabular-nums">
                    {formatMoney(withdrawal.remaining)}
                </span>
                <span className="text-muted-foreground text-xs">
                    left of {formatMoney(withdrawal.amount)}
                </span>
            </p>

            <SpendMeter amount={withdrawal.amount} spent={withdrawal.spent} />

            <div className="flex items-center justify-between gap-2">
                {/* Stretched button makes the whole card open the details. */}
                <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm text-xs font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:ring-3"
                    onClick={() => actions.openWithdrawal(withdrawal.id)}
                >
                    View bills
                </button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="relative z-10"
                    onClick={() => actions.addBill(withdrawal.id)}
                >
                    <Plus className="size-3.5" />
                    Add bill
                </Button>
            </div>
        </li>
    );
}
