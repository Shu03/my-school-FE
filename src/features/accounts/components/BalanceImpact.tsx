import type { JSX } from "react";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { formatMoney } from "../lib/format";

interface BalanceImpactProps {
    /** What the balance represents, e.g. "In the bank". */
    label: string;
    current: number;
    next: number;
    /** Shown when `next` goes negative, e.g. "Exceeds the bank balance". */
    overLabel: string;
}

/** Live before → after preview of the balance a form entry will move. */
export function BalanceImpact({
    label,
    current,
    next,
    overLabel,
}: BalanceImpactProps): JSX.Element {
    const reduceMotion = useReducedMotion();
    const isOver = next < 0;

    return (
        <div
            aria-live="polite"
            className={cn(
                "grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-200",
                isOver ? "border-destructive/30 bg-destructive/5" : "border-border/70 bg-muted/30",
            )}
        >
            <div className="min-w-0">
                <p className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.12em] uppercase">
                    {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold tabular-nums">
                    {formatMoney(current)}
                </p>
            </div>

            <ArrowRight
                className={cn("size-4", isOver ? "text-destructive" : "text-muted-foreground")}
                aria-hidden="true"
            />

            <div className="min-w-0 text-right">
                <p
                    className={cn(
                        "text-[0.7rem] font-semibold tracking-[0.12em] uppercase",
                        isOver ? "text-destructive" : "text-muted-foreground",
                    )}
                >
                    {isOver ? overLabel : "Afterwards"}
                </p>
                <motion.p
                    key={isOver ? "over" : "ok"}
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={cn(
                        "mt-1 truncate text-base font-bold tabular-nums",
                        isOver ? "text-destructive" : "text-primary",
                    )}
                >
                    {isOver ? `Short ${formatMoney(Math.abs(next))}` : formatMoney(next)}
                </motion.p>
            </div>
        </div>
    );
}
