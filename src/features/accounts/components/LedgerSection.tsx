import { useMemo, useState } from "react";
import type { ComponentType, JSX, ReactNode } from "react";

import { ArrowDownToLine, HandCoins, Plus, Receipt } from "lucide-react";

import { ACCOUNT_TABS, type AccountTab } from "@constants/accounts.constants";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAccountActions } from "../hooks/useAccountActions";
import {
    useBillsList,
    useDepositsList,
    useWithdrawal,
    useWithdrawalOptions,
    useWithdrawalsList,
} from "../hooks/useAccounts";
import { useLedgerPaging, type LedgerPaging } from "../hooks/useLedgerPaging";
import { getAccountsErrorMessage } from "../lib/errors";
import { formatDateOnly, formatMoney, parseMoney } from "../lib/format";
import type { AccountsPage, DateRange } from "../types/account.types";

import { AccountsPagination } from "./AccountsPagination";
import { BillsTable } from "./BillsTable";
import { DateRangeFilter } from "./DateRangeFilter";
import { DepositsTable } from "./DepositsTable";
import { LedgerError, UsageRing } from "./LedgerParts";
import { WithdrawalPicker } from "./WithdrawalPicker";
import { WithdrawalsTable } from "./WithdrawalsTable";

interface LedgerSectionProps {
    tab: AccountTab;
    withdrawalFilter: string | null;
    onTabChange: (tab: AccountTab) => void;
    onWithdrawalFilterChange: (withdrawalId: string | null) => void;
}

export function LedgerSection({
    tab,
    withdrawalFilter,
    onTabChange,
    onWithdrawalFilterChange,
}: LedgerSectionProps): JSX.Element {
    // One date range for the whole ledger, so switching tabs never hides entries unexpectedly.
    const [range, setRangeState] = useState<DateRange>({});
    const depositsPaging = useLedgerPaging();
    const withdrawalsPaging = useLedgerPaging();
    const billsPaging = useLedgerPaging();

    const [lastFilter, setLastFilter] = useState(withdrawalFilter);
    if (lastFilter !== withdrawalFilter) {
        setLastFilter(withdrawalFilter);
        billsPaging.reset();
    }

    function setRange(next: DateRange): void {
        setRangeState(next);
        depositsPaging.reset();
        withdrawalsPaging.reset();
        billsPaging.reset();
    }

    const deposits = useDepositsList({
        page: depositsPaging.page,
        limit: depositsPaging.limit,
        ...range,
    });
    const withdrawals = useWithdrawalsList({
        page: withdrawalsPaging.page,
        limit: withdrawalsPaging.limit,
        ...range,
    });
    const bills = useBillsList({
        page: billsPaging.page,
        limit: billsPaging.limit,
        withdrawalId: withdrawalFilter ?? undefined,
        ...range,
    });

    depositsPaging.clampTo(deposits.data);
    withdrawalsPaging.clampTo(withdrawals.data);
    billsPaging.clampTo(bills.data);

    const { data: withdrawalOptions = [] } = useWithdrawalOptions();
    const withdrawalsById = useMemo(
        () => new Map(withdrawalOptions.map((item) => [item.id, item])),
        [withdrawalOptions],
    );

    const isDateFiltered = Boolean(range.startDate || range.endDate);

    const tabs: {
        value: AccountTab;
        label: string;
        icon: ComponentType<{ className?: string }>;
        total: number | undefined;
    }[] = [
        {
            value: ACCOUNT_TABS.DEPOSITS,
            label: "Deposits",
            icon: ArrowDownToLine,
            total: deposits.data?.total,
        },
        {
            value: ACCOUNT_TABS.WITHDRAWALS,
            label: "Withdrawals",
            icon: HandCoins,
            total: withdrawals.data?.total,
        },
        { value: ACCOUNT_TABS.BILLS, label: "Bills", icon: Receipt, total: bills.data?.total },
    ];

    return (
        <section
            aria-labelledby="ledger-heading"
            className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1"
        >
            <h2 id="ledger-heading" className="sr-only">
                Ledger
            </h2>
            <Tabs
                value={tab}
                onValueChange={(value) => onTabChange(value as AccountTab)}
                className="gap-0"
            >
                <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
                    <TabsList className="h-10 w-full sm:w-auto">
                        {tabs.map((item) => (
                            <TabsTrigger
                                key={item.value}
                                value={item.value}
                                className="gap-2 px-3.5"
                            >
                                <item.icon className="size-4" />
                                {item.label}
                                {item.total !== undefined && (
                                    <span className="bg-foreground/[0.07] text-muted-foreground min-w-5 rounded-full px-1.5 text-center text-[0.7rem] font-semibold tabular-nums">
                                        {item.total}
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex flex-wrap items-center gap-2">
                        {tab === ACCOUNT_TABS.BILLS && (
                            <WithdrawalPicker
                                value={withdrawalFilter}
                                onChange={onWithdrawalFilterChange}
                            />
                        )}
                        <DateRangeFilter value={range} onChange={setRange} />
                    </div>
                </div>

                <TabsContent value={ACCOUNT_TABS.DEPOSITS}>
                    <LedgerBody
                        query={deposits}
                        paging={depositsPaging}
                        table={
                            <DepositsTable
                                deposits={deposits.data?.data ?? []}
                                isLoading={deposits.isLoading}
                                isRefreshing={deposits.isFetching && !deposits.isLoading}
                                isFiltered={isDateFiltered}
                            />
                        }
                    />
                </TabsContent>

                <TabsContent value={ACCOUNT_TABS.WITHDRAWALS}>
                    <LedgerBody
                        query={withdrawals}
                        paging={withdrawalsPaging}
                        table={
                            <WithdrawalsTable
                                withdrawals={withdrawals.data?.data ?? []}
                                isLoading={withdrawals.isLoading}
                                isRefreshing={withdrawals.isFetching && !withdrawals.isLoading}
                                isFiltered={isDateFiltered}
                            />
                        }
                    />
                </TabsContent>

                <TabsContent value={ACCOUNT_TABS.BILLS}>
                    {withdrawalFilter && <WithdrawalFocus withdrawalId={withdrawalFilter} />}
                    <LedgerBody
                        query={bills}
                        paging={billsPaging}
                        table={
                            <BillsTable
                                bills={bills.data?.data ?? []}
                                withdrawalsById={withdrawalsById}
                                showWithdrawal={!withdrawalFilter}
                                isLoading={bills.isLoading}
                                isRefreshing={bills.isFetching && !bills.isLoading}
                                isFiltered={isDateFiltered || Boolean(withdrawalFilter)}
                            />
                        }
                    />
                </TabsContent>
            </Tabs>
        </section>
    );
}

interface LedgerBodyProps {
    query: {
        data: AccountsPage<unknown> | undefined;
        error: Error | null;
        isError: boolean;
        refetch: () => Promise<unknown>;
    };
    paging: LedgerPaging;
    table: ReactNode;
}

function LedgerBody({ query, paging, table }: LedgerBodyProps): JSX.Element {
    if (query.isError) {
        return (
            <div className="p-6">
                <LedgerError
                    message={getAccountsErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                />
            </div>
        );
    }

    return (
        <>
            {table}
            {query.data && query.data.total > 0 && (
                <div className="border-border/60 border-t px-6 py-3">
                    <AccountsPagination
                        page={paging.page}
                        limit={paging.limit}
                        total={query.data.total}
                        onPageChange={paging.setPage}
                        onLimitChange={paging.setLimit}
                    />
                </div>
            )}
        </>
    );
}

/** Shows the withdrawal's arithmetic above its bills: withdrawn − billed = in hand. */
function WithdrawalFocus({ withdrawalId }: { withdrawalId: string }): JSX.Element {
    const actions = useAccountActions();
    const { data: withdrawal, isLoading, isError } = useWithdrawal(withdrawalId);

    if (isLoading) {
        return (
            <div className="border-border/60 flex items-center gap-2 border-b px-6 py-5">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading withdrawal...</span>
            </div>
        );
    }

    if (isError || !withdrawal) {
        return (
            <div className="border-border/60 text-muted-foreground border-b px-6 py-4 text-sm">
                This withdrawal no longer exists. Clear the “Paid from” filter to see every bill.
            </div>
        );
    }

    const hasCashLeft = parseMoney(withdrawal.remaining) > 0;

    return (
        <div className="border-border/60 from-chart-1/[0.12] flex flex-wrap items-center gap-x-8 gap-y-4 border-b bg-linear-to-r to-transparent px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
                <UsageRing amount={withdrawal.amount} spent={withdrawal.spent} size={40} />
                <div className="min-w-0">
                    <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                        Bills paid from
                    </p>
                    <button
                        type="button"
                        className="focus-visible:ring-ring/50 truncate rounded-sm text-sm font-semibold tabular-nums underline-offset-4 outline-none hover:underline focus-visible:ring-3"
                        onClick={() => actions.openWithdrawal(withdrawal.id)}
                    >
                        {formatDateOnly(withdrawal.withdrawnOn)} withdrawal
                        {withdrawal.withdrawnBy && ` · ${withdrawal.withdrawnBy}`}
                    </button>
                </div>
            </div>

            <dl
                className="flex items-end gap-3 tabular-nums sm:gap-4"
                aria-label="Withdrawn minus billed equals cash in hand"
            >
                <EquationTerm label="Withdrawn" value={withdrawal.amount} />
                <Operator symbol="−" />
                <EquationTerm label="Billed" value={withdrawal.spent} />
                <Operator symbol="=" />
                <EquationTerm label="In hand" value={withdrawal.remaining} emphasis />
            </dl>

            <Button
                type="button"
                size="sm"
                className="texture-sheen ml-auto"
                disabled={!hasCashLeft}
                onClick={() => actions.addBill(withdrawal.id)}
            >
                <Plus className="size-3.5" />
                {hasCashLeft ? "Add bill" : "Fully billed"}
            </Button>
        </div>
    );
}

function EquationTerm({
    label,
    value,
    emphasis = false,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}): JSX.Element {
    return (
        <div>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className={emphasis ? "text-base font-bold" : "text-sm font-semibold"}>
                {formatMoney(value)}
            </dd>
        </div>
    );
}

function Operator({ symbol }: { symbol: string }): JSX.Element {
    return (
        <span className="text-muted-foreground pb-0.5 text-sm" aria-hidden="true">
            {symbol}
        </span>
    );
}
