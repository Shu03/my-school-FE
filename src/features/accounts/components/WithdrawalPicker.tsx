import { useState } from "react";
import type { JSX, ReactNode } from "react";

import { Check, ChevronDown, HandCoins, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useWithdrawalOptions } from "../hooks/useAccounts";
import { formatDateOnly, formatMoney, parseMoney } from "../lib/format";
import type { Withdrawal } from "../types/account.types";

import { UsageRing } from "./LedgerParts";

interface WithdrawalPickerProps {
    value: string | null;
    onChange: (withdrawalId: string | null) => void;
}

function matchesQuery(withdrawal: Withdrawal, query: string): boolean {
    const haystack = [
        formatDateOnly(withdrawal.withdrawnOn),
        withdrawal.withdrawnBy ?? "",
        withdrawal.amount,
        formatMoney(withdrawal.amount),
        withdrawal.note ?? "",
    ]
        .join(" ")
        .toLowerCase();
    return haystack.includes(query);
}

/** Chooses which withdrawal's bills the ledger shows. */
export function WithdrawalPicker({ value, onChange }: WithdrawalPickerProps): JSX.Element {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const { data: withdrawals = [], isLoading } = useWithdrawalOptions();

    const selected = withdrawals.find((item) => item.id === value);
    const normalizedQuery = query.trim().toLowerCase();
    const visible = normalizedQuery
        ? withdrawals.filter((item) => matchesQuery(item, normalizedQuery))
        : withdrawals;
    const withCash = visible.filter((item) => parseMoney(item.remaining) > 0);
    const settled = visible.filter((item) => parseMoney(item.remaining) <= 0);

    function select(withdrawalId: string | null): void {
        onChange(withdrawalId);
        setOpen(false);
    }

    return (
        <div className="inline-flex items-stretch">
            <Popover
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) {
                        setQuery("");
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "focus-visible:ring-ring/50 inline-flex h-9 max-w-72 items-center gap-2 border px-3 text-sm transition-colors outline-none focus-visible:ring-3",
                            value
                                ? "border-primary/35 bg-primary/[0.06] rounded-l-lg border-r-0"
                                : "border-input hover:bg-muted/60 rounded-lg",
                        )}
                    >
                        {selected ? (
                            <UsageRing amount={selected.amount} spent={selected.spent} size={16} />
                        ) : (
                            <HandCoins
                                className={cn(
                                    "size-4",
                                    value ? "text-primary" : "text-muted-foreground",
                                )}
                                aria-hidden="true"
                            />
                        )}
                        <span className="text-muted-foreground hidden sm:inline">Paid from</span>
                        <span className="truncate font-semibold tabular-nums">
                            {selected
                                ? `${formatDateOnly(selected.withdrawnOn)} · ${formatMoney(selected.amount)}`
                                : value
                                  ? "One withdrawal"
                                  : "Any withdrawal"}
                        </span>
                        <ChevronDown
                            className="text-muted-foreground size-3.5 shrink-0"
                            aria-hidden="true"
                        />
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    align="end"
                    className="flex w-[min(24rem,calc(100vw-2rem))] flex-col p-0"
                >
                    <div className="border-border/60 relative border-b p-2">
                        <Search
                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4.5 size-3.5 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by date, name or amount"
                            aria-label="Search withdrawals"
                            className="h-9 border-0 pl-8 shadow-none focus-visible:ring-0"
                        />
                    </div>

                    <div className="max-h-80 overflow-y-auto p-1.5">
                        <PickerOption isActive={value === null} onSelect={() => select(null)}>
                            <span className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-lg">
                                <HandCoins className="size-3.5" />
                            </span>
                            <span className="flex-1 text-sm font-medium">Any withdrawal</span>
                        </PickerOption>

                        {isLoading && (
                            <div className="flex justify-center py-6">
                                <Spinner />
                            </div>
                        )}

                        {!isLoading && visible.length === 0 && (
                            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                                {withdrawals.length === 0
                                    ? "No withdrawals recorded yet."
                                    : "No withdrawal matches that search."}
                            </p>
                        )}

                        {withCash.length > 0 && (
                            <PickerGroup label="Cash still in hand">
                                {withCash.map((item) => (
                                    <WithdrawalOption
                                        key={item.id}
                                        withdrawal={item}
                                        isActive={value === item.id}
                                        onSelect={() => select(item.id)}
                                    />
                                ))}
                            </PickerGroup>
                        )}

                        {settled.length > 0 && (
                            <PickerGroup label="Fully billed">
                                {settled.map((item) => (
                                    <WithdrawalOption
                                        key={item.id}
                                        withdrawal={item}
                                        isActive={value === item.id}
                                        onSelect={() => select(item.id)}
                                    />
                                ))}
                            </PickerGroup>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {value && (
                <button
                    type="button"
                    aria-label="Show bills from any withdrawal"
                    title="Show bills from any withdrawal"
                    className="border-primary/35 bg-primary/[0.06] text-muted-foreground hover:text-foreground hover:bg-primary/10 focus-visible:ring-ring/50 inline-flex w-8 items-center justify-center rounded-r-lg border border-l-0 transition-colors outline-none focus-visible:ring-3"
                    onClick={() => onChange(null)}
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}

function PickerGroup({ label, children }: { label: string; children: ReactNode }): JSX.Element {
    return (
        <div role="group" aria-label={label} className="mt-2">
            <p className="text-muted-foreground px-2.5 pt-1 pb-1.5 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                {label}
            </p>
            {children}
        </div>
    );
}

function PickerOption({
    isActive,
    onSelect,
    children,
}: {
    isActive: boolean;
    onSelect: () => void;
    children: ReactNode;
}): JSX.Element {
    return (
        <button
            type="button"
            aria-pressed={isActive}
            onClick={onSelect}
            className={cn(
                "focus-visible:ring-ring/50 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors outline-none focus-visible:ring-3",
                isActive ? "bg-primary/10" : "hover:bg-muted",
            )}
        >
            {children}
            {isActive && <Check className="text-primary size-4 shrink-0" aria-hidden="true" />}
        </button>
    );
}

function WithdrawalOption({
    withdrawal,
    isActive,
    onSelect,
}: {
    withdrawal: Withdrawal;
    isActive: boolean;
    onSelect: () => void;
}): JSX.Element {
    const hasCash = parseMoney(withdrawal.remaining) > 0;

    return (
        <PickerOption isActive={isActive} onSelect={onSelect}>
            <span className="flex size-7 items-center justify-center">
                <UsageRing amount={withdrawal.amount} spent={withdrawal.spent} size={22} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium tabular-nums">
                    {formatDateOnly(withdrawal.withdrawnOn)}
                    <span className="text-muted-foreground font-normal">
                        {" · "}
                        {formatMoney(withdrawal.amount)}
                    </span>
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                    {withdrawal.withdrawnBy ?? "No name recorded"}
                </span>
            </span>
            <span
                className={cn(
                    "shrink-0 text-right text-xs tabular-nums",
                    hasCash ? "text-foreground font-semibold" : "text-muted-foreground",
                )}
            >
                {hasCash ? `${formatMoney(withdrawal.remaining)} left` : "Billed"}
            </span>
        </PickerOption>
    );
}
