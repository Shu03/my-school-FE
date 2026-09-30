import type { ComponentType, CSSProperties, JSX, ReactNode } from "react";

import { AlertCircle, ChevronRight, HandCoins, Landmark, Plus, Receipt } from "lucide-react";

import { Stagger, StaggerItem } from "@components/common/Motion";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useAccountActions } from "../hooks/useAccountActions";
import { useAccountSummary } from "../hooks/useAccounts";
import { getAccountsErrorMessage } from "../lib/errors";
import { formatMoney, parseMoney } from "../lib/format";
import { SPENT_PATTERN } from "../lib/visuals";

/**
 * Money only moves one way — bank → cash in hand → bills — so the page opens with
 * those three places side by side, each holding the action that adds money to it.
 */
export function MoneyFlow(): JSX.Element {
    const actions = useAccountActions();
    const { data: summary, error, isLoading, isError, refetch } = useAccountSummary();

    const bank = parseMoney(summary?.totalBalance);
    const cash = parseMoney(summary?.withdrawnBalance);

    return (
        <section className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
            <header className="border-border/60 from-primary/12 via-primary/5 flex items-center gap-4 border-b bg-linear-to-br to-transparent px-6 py-5">
                <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-11 shrink-0 items-center justify-center rounded-xl ring-1">
                    <Landmark className="size-5" />
                </span>
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight">Accounts</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                        Follow every rupee from the bank, into cash, and out as bills.
                    </p>
                </div>
            </header>

            <div className="p-6">
                {isError ? (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertDescription className="flex items-center justify-between gap-4">
                            <span>{getAccountsErrorMessage(error)}</span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void refetch()}
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : isLoading || !summary ? (
                    <div className="grid gap-4 md:grid-cols-3" aria-busy="true">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div
                                key={index}
                                className="bg-muted h-44 animate-pulse rounded-2xl motion-reduce:animate-none"
                            />
                        ))}
                    </div>
                ) : (
                    <Stagger className="grid gap-4 md:grid-cols-3">
                        <StaggerItem>
                            <Station
                                icon={Landmark}
                                place="In the bank"
                                term="Total balance"
                                value={summary.totalBalance}
                                detail={
                                    <>
                                        <Figure value={summary.totalDeposited} /> deposited in total
                                    </>
                                }
                                surface="bg-primary/[0.07] ring-primary/20"
                                swatch="bg-primary"
                                action={
                                    <Button
                                        className="texture-sheen w-full"
                                        onClick={actions.addDeposit}
                                    >
                                        <Plus className="size-4" />
                                        Deposit money
                                    </Button>
                                }
                            />
                        </StaggerItem>

                        <StaggerItem>
                            <Station
                                icon={HandCoins}
                                place="Cash in hand"
                                term="Withdrawn balance"
                                value={summary.withdrawnBalance}
                                detail={
                                    bank > 0 ? (
                                        <>
                                            <Figure value={summary.totalWithdrawn} /> withdrawn in
                                            total
                                        </>
                                    ) : (
                                        "Nothing in the bank to withdraw yet"
                                    )
                                }
                                surface="bg-chart-1/[0.14] ring-chart-1/45"
                                swatch="bg-chart-1"
                                arrowLabel="Withdrawn from the bank"
                                action={
                                    <Button
                                        variant="outline"
                                        className="bg-card w-full"
                                        disabled={bank <= 0}
                                        onClick={actions.addWithdrawal}
                                    >
                                        <HandCoins className="size-4" />
                                        Withdraw cash
                                    </Button>
                                }
                            />
                        </StaggerItem>

                        <StaggerItem>
                            <Station
                                icon={Receipt}
                                place="Spent on bills"
                                term="Total spent"
                                value={summary.totalSpent}
                                detail={
                                    cash > 0
                                        ? "Paid out of withdrawn cash"
                                        : "Withdraw cash before adding bills"
                                }
                                surface="bg-muted/50 ring-border"
                                swatch="bg-muted-foreground/45"
                                swatchStyle={SPENT_PATTERN}
                                arrowLabel="Spent from cash in hand"
                                action={
                                    <Button
                                        variant="outline"
                                        className="bg-card w-full"
                                        disabled={cash <= 0}
                                        onClick={() => actions.addBill()}
                                    >
                                        <Receipt className="size-4" />
                                        Add bill
                                    </Button>
                                }
                            />
                        </StaggerItem>
                    </Stagger>
                )}
            </div>
        </section>
    );
}

function Figure({ value }: { value: string }): JSX.Element {
    return <span className="text-foreground font-semibold tabular-nums">{formatMoney(value)}</span>;
}

interface StationProps {
    icon: ComponentType<{ className?: string }>;
    place: string;
    /** The formal ledger name for this figure. */
    term: string;
    value: string;
    detail: ReactNode;
    surface: string;
    swatch: string;
    swatchStyle?: CSSProperties;
    /** Present on stations that receive money from the one before them. */
    arrowLabel?: string;
    action: ReactNode;
}

function Station({
    icon: Icon,
    place,
    term,
    value,
    detail,
    surface,
    swatch,
    swatchStyle,
    arrowLabel,
    action,
}: StationProps): JSX.Element {
    return (
        <div
            className={cn(
                "texture-grain relative flex h-full flex-col gap-4 rounded-2xl p-5 ring-1",
                surface,
            )}
        >
            {arrowLabel && (
                <span
                    className="bg-card ring-border text-muted-foreground absolute top-1/2 -left-[1.375rem] z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full shadow-sm ring-1 md:flex"
                    title={arrowLabel}
                    aria-hidden="true"
                >
                    <ChevronRight className="size-4" />
                </span>
            )}

            <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn("size-2.5 rounded-sm", swatch)} style={swatchStyle} />
                    {place}
                </p>
                <Icon className="text-muted-foreground size-4" aria-hidden="true" />
            </div>

            <div>
                <p className="text-[clamp(1.25rem,2.2vw,1.75rem)] leading-none font-bold tracking-tight tabular-nums">
                    {formatMoney(value)}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                    <span className="font-medium">{term}</span>
                    <span aria-hidden="true"> · </span>
                    {detail}
                </p>
            </div>

            <div className="mt-auto">{action}</div>
        </div>
    );
}
