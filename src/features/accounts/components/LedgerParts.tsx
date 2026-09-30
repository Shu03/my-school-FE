import type { ComponentType, JSX, ReactNode } from "react";

import { AlertCircle, Clock, Pencil, Trash2 } from "lucide-react";

import { CASH_STALE_AFTER_DAYS } from "@constants/accounts.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { formatMoney, parseMoney, userFullName, userInitials } from "../lib/format";
import { SPENT_PATTERN } from "../lib/visuals";
import type { AccountUser } from "../types/account.types";

interface LedgerTableProps {
    head: ReactNode;
    columnCount: number;
    isLoading: boolean;
    isRefreshing: boolean;
    isEmpty: boolean;
    loadingLabel: string;
    empty: ReactNode;
    children: ReactNode;
}

export function LedgerTable({
    head,
    columnCount,
    isLoading,
    isRefreshing,
    isEmpty,
    loadingLabel,
    empty,
    children,
}: LedgerTableProps): JSX.Element {
    return (
        <div className="relative" aria-busy={isLoading || isRefreshing}>
            {isRefreshing && (
                <span
                    className="bg-primary/70 absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse motion-reduce:animate-none"
                    aria-hidden="true"
                />
            )}
            <Table>
                <TableHeader className="bg-muted/30 [&_th]:text-muted-foreground [&_th]:h-9 [&_th]:text-[0.7rem] [&_th]:font-semibold [&_th]:tracking-[0.1em] [&_th]:uppercase [&_th:first-child]:pl-6 [&_th:last-child]:pr-6">
                    <TableRow>{head}</TableRow>
                </TableHeader>
                <TableBody className="[&_td]:py-3 [&_td:first-child]:pl-6 [&_td:last-child]:pr-6">
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={columnCount}>
                                <div className="flex items-center justify-center gap-2 py-12">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        {loadingLabel}
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : isEmpty ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={columnCount}>{empty}</TableCell>
                        </TableRow>
                    ) : (
                        children
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export function LedgerError({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}): JSX.Element {
    return (
        <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription className="flex items-center justify-between gap-4">
                <span>{message}</span>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                    Retry
                </Button>
            </AlertDescription>
        </Alert>
    );
}

interface LedgerEmptyProps {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    action?: ReactNode;
}

export function LedgerEmpty({
    icon: Icon,
    title,
    description,
    action,
}: LedgerEmptyProps): JSX.Element {
    return (
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center whitespace-normal">
            <span className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-xl">
                <Icon className="size-5" />
            </span>
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function RecordedBy({ user }: { user: AccountUser | null }): JSX.Element {
    if (!user) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <span className="flex items-center gap-2">
            <span
                className="bg-primary/10 text-primary texture-sheen flex size-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold"
                aria-hidden="true"
            >
                {userInitials(user)}
            </span>
            <span className="truncate text-sm">{userFullName(user)}</span>
        </span>
    );
}

export function NoteText({ note }: { note: string | null }): JSX.Element {
    if (!note) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <span className="text-muted-foreground block max-w-56 truncate" title={note}>
            {note}
        </span>
    );
}

interface SpendMeterProps {
    amount: string;
    spent: string;
    className?: string;
}

/** Compact donut of a withdrawal's usage: grey is billed, orange is still in hand. */
export function UsageRing({
    amount,
    spent,
    size = 18,
    className,
}: SpendMeterProps & { size?: number }): JSX.Element {
    const total = parseMoney(amount);
    const share = total > 0 ? Math.min(parseMoney(spent) / total, 1) : 0;
    const strokeWidth = size / 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={cn("shrink-0 -rotate-90", className)}
            aria-hidden="true"
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                className="stroke-chart-1"
            />
            {share > 0 && (
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference * share} ${circumference}`}
                    className="stroke-muted-foreground/60"
                />
            )}
        </svg>
    );
}

/** Share of a withdrawal already spent on bills; the rest is still cash in hand. */
export function SpendMeter({ amount, spent, className }: SpendMeterProps): JSX.Element {
    const total = parseMoney(amount);
    const used = parseMoney(spent);
    const share = total > 0 ? Math.min(used / total, 1) * 100 : 0;

    return (
        <span
            role="meter"
            aria-label={`${formatMoney(used)} of ${formatMoney(total)} spent`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(share)}
            className={cn("bg-chart-1 flex h-1.5 w-full overflow-hidden rounded-full", className)}
        >
            <span
                className="bg-muted-foreground/45 h-full transition-[width] duration-500 motion-reduce:transition-none"
                style={{ ...SPENT_PATTERN, width: `${share}%` }}
            />
        </span>
    );
}

/** How long withdrawn cash has been out; turns amber once it needs chasing. */
export function AgeChip({ days }: { days: number }): JSX.Element {
    const isStale = days >= CASH_STALE_AFTER_DAYS;
    const label = days === 0 ? "Drawn today" : `Out ${days} ${days === 1 ? "day" : "days"}`;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap tabular-nums",
                isStale ? "bg-warning/12 text-warning" : "bg-muted text-muted-foreground",
            )}
            title={isStale ? "Cash has been out a while — collect the bills" : undefined}
        >
            {isStale && <Clock className="size-3" aria-hidden="true" />}
            {label}
        </span>
    );
}

interface RowActionsProps {
    label: string;
    isDeleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

/** Row-level edit/delete that never triggers the row's own click handler. */
export function RowActions({ label, isDeleting, onEdit, onDelete }: RowActionsProps): JSX.Element {
    return (
        <div
            className="flex items-center justify-end gap-1"
            onClick={(event) => event.stopPropagation()}
        >
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${label}`}
                onClick={onEdit}
            >
                <Pencil className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${label}`}
                className="hover:bg-destructive/10 hover:text-destructive"
                disabled={isDeleting}
                onClick={onDelete}
            >
                {isDeleting ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
            </Button>
        </div>
    );
}
