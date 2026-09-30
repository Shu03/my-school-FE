import { useRef } from "react";
import type { JSX } from "react";

import { useSearchParams } from "react-router-dom";

import {
    ACCOUNT_SEARCH_PARAMS,
    ACCOUNT_TABS,
    UUID_PATTERN,
    type AccountTab,
} from "@constants/accounts.constants";

import { AccountActionsProvider } from "../components/AccountActionsProvider";
import { LedgerSection } from "../components/LedgerSection";
import { MoneyFlow } from "../components/MoneyFlow";
import { OpenCashSection } from "../components/OpenCashSection";

const TABS = Object.values(ACCOUNT_TABS);

function resolveTab(value: string | null): AccountTab {
    return TABS.includes(value as AccountTab) ? (value as AccountTab) : ACCOUNT_TABS.DEPOSITS;
}

export function AccountsPage(): JSX.Element {
    const ledgerRef = useRef<HTMLDivElement>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = resolveTab(searchParams.get(ACCOUNT_SEARCH_PARAMS.TAB));
    const rawWithdrawalId = searchParams.get(ACCOUNT_SEARCH_PARAMS.WITHDRAWAL_ID);
    const withdrawalFilter =
        rawWithdrawalId && UUID_PATTERN.test(rawWithdrawalId) ? rawWithdrawalId : null;

    function updateParams(tabValue: AccountTab, withdrawalId?: string | null): void {
        setSearchParams(
            (previous) => {
                const next = new URLSearchParams(previous);
                next.set(ACCOUNT_SEARCH_PARAMS.TAB, tabValue);
                if (withdrawalId !== undefined) {
                    if (withdrawalId) {
                        next.set(ACCOUNT_SEARCH_PARAMS.WITHDRAWAL_ID, withdrawalId);
                    } else {
                        next.delete(ACCOUNT_SEARCH_PARAMS.WITHDRAWAL_ID);
                    }
                }
                return next;
            },
            { replace: true },
        );
    }

    function revealLedger(): void {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        ledgerRef.current?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
        });
    }

    function showBillsFor(withdrawalId: string | null): void {
        updateParams(ACCOUNT_TABS.BILLS, withdrawalId);
        revealLedger();
    }

    function showWithdrawals(): void {
        updateParams(ACCOUNT_TABS.WITHDRAWALS);
        revealLedger();
    }

    return (
        <AccountActionsProvider onShowBills={showBillsFor} onShowWithdrawals={showWithdrawals}>
            <div className="flex flex-col gap-6">
                <MoneyFlow />
                <OpenCashSection />
                <div ref={ledgerRef} className="scroll-mt-4">
                    <LedgerSection
                        tab={tab}
                        withdrawalFilter={withdrawalFilter}
                        onTabChange={(value) => updateParams(value)}
                        onWithdrawalFilterChange={(withdrawalId) =>
                            updateParams(ACCOUNT_TABS.BILLS, withdrawalId)
                        }
                    />
                </div>
            </div>
        </AccountActionsProvider>
    );
}
