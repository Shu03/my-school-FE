import type { JSX } from "react";

import { AlertCircle, ListFilter, Pencil, Plus, Trash2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";

import { useAccountActions } from "../hooks/useAccountActions";
import { useWithdrawal } from "../hooks/useAccounts";
import { getAccountsErrorMessage } from "../lib/errors";
import { daysSince, formatDateOnly, formatMoney, parseMoney } from "../lib/format";
import { SPENT_PATTERN } from "../lib/visuals";
import type { Withdrawal } from "../types/account.types";

import { AgeChip, RecordedBy, SpendMeter } from "./LedgerParts";
import { WithdrawalStatement } from "./WithdrawalStatement";

interface WithdrawalDetailSheetProps {
    open: boolean;
    withdrawalId: string | null;
    onOpenChange: (open: boolean) => void;
}

export function WithdrawalDetailSheet({
    open,
    withdrawalId,
    onOpenChange,
}: WithdrawalDetailSheetProps): JSX.Element {
    const { data: withdrawal, error, isLoading, isError } = useWithdrawal(withdrawalId);

    return (
        <Sheet open={open && Boolean(withdrawalId)} onOpenChange={onOpenChange}>
            <SheetContent className="gap-0 sm:max-w-md">
                {isLoading && (
                    <>
                        <SheetHeader className="sr-only">
                            <SheetTitle>Withdrawal</SheetTitle>
                            <SheetDescription>Loading withdrawal details</SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-1 items-center justify-center">
                            <Spinner />
                        </div>
                    </>
                )}

                {isError && (
                    <>
                        <SheetHeader>
                            <SheetTitle>Withdrawal</SheetTitle>
                            <SheetDescription className="sr-only">
                                The withdrawal could not be loaded
                            </SheetDescription>
                        </SheetHeader>
                        <div className="px-5">
                            <Alert variant="destructive">
                                <AlertCircle />
                                <AlertDescription>
                                    {getAccountsErrorMessage(error)}
                                </AlertDescription>
                            </Alert>
                        </div>
                    </>
                )}

                {withdrawal && <WithdrawalDetail withdrawal={withdrawal} />}
            </SheetContent>
        </Sheet>
    );
}

function WithdrawalDetail({ withdrawal }: { withdrawal: Withdrawal }): JSX.Element {
    const actions = useAccountActions();
    const hasCashLeft = parseMoney(withdrawal.remaining) > 0;

    return (
        <>
            <SheetHeader className="border-border/60 from-primary/12 via-primary/5 gap-0 border-b bg-linear-to-br to-transparent px-6 pt-6 pb-5">
                <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Withdrawn {formatDateOnly(withdrawal.withdrawnOn)}
                    </p>
                    {hasCashLeft && <AgeChip days={daysSince(withdrawal.withdrawnOn)} />}
                </div>
                <SheetTitle className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                    {formatMoney(withdrawal.remaining)}
                    <span className="text-muted-foreground ml-2 text-sm font-medium tracking-normal">
                        left of {formatMoney(withdrawal.amount)}
                    </span>
                </SheetTitle>
                <SheetDescription className="mt-1">
                    {withdrawal.withdrawnBy
                        ? `Cash taken by ${withdrawal.withdrawnBy}`
                        : "Cash drawn from the school account"}
                </SheetDescription>

                <SpendMeter
                    amount={withdrawal.amount}
                    spent={withdrawal.spent}
                    className="mt-5 h-2"
                />
                <div className="mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <span
                            className="bg-muted-foreground/45 size-2.5 rounded-sm"
                            style={SPENT_PATTERN}
                            aria-hidden="true"
                        />
                        {formatMoney(withdrawal.spent)} billed
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <span className="bg-chart-1 size-2.5 rounded-sm" aria-hidden="true" />
                        {formatMoney(withdrawal.remaining)} in hand
                    </span>
                </div>

                <Button
                    type="button"
                    className="texture-sheen mt-5 w-full"
                    disabled={!hasCashLeft}
                    onClick={() => actions.addBill(withdrawal.id)}
                >
                    <Plus className="size-4" />
                    {hasCashLeft ? "Add a bill from this cash" : "Fully accounted for"}
                </Button>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
                <section className="flex flex-col gap-3">
                    <h2 className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Where this cash went
                    </h2>
                    <WithdrawalStatement withdrawal={withdrawal} showAddBill={false} />
                </section>

                <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="col-span-2">
                        <dt className="text-muted-foreground text-xs">Note</dt>
                        <dd className="mt-1 text-sm break-words">
                            {withdrawal.note ?? <span className="text-muted-foreground">—</span>}
                        </dd>
                    </div>
                    <div className="col-span-2">
                        <dt className="text-muted-foreground text-xs">Recorded by</dt>
                        <dd className="mt-1">
                            <RecordedBy user={withdrawal.recordedBy} />
                        </dd>
                    </div>
                </dl>
            </div>

            <SheetFooter className="flex flex-row items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.editWithdrawal(withdrawal)}
                >
                    <Pencil className="size-3.5" />
                    Edit
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => actions.deleteWithdrawal(withdrawal)}
                >
                    <Trash2 className="size-3.5" />
                    Delete
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => actions.showBillsFor(withdrawal.id)}
                >
                    <ListFilter className="size-3.5" />
                    Show in ledger
                </Button>
            </SheetFooter>
        </>
    );
}
