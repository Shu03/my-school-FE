import type { ComponentType, JSX, ReactNode } from "react";

import { EXAM_TYPE_LABELS } from "@constants/exams.constants";

import { cn } from "@/lib/utils";

import { relativeDayLabel, type Tone } from "../lib/format";
import { TONE_FILL, TONE_TINT } from "../lib/tone";
import type { ExamType } from "../types/dashboard.types";

interface StatusChipProps {
    tone: Tone;
    children: ReactNode;
    icon?: ComponentType<{ className?: string }>;
    /** Leading dot for status-like chips; text is always present so colour is never the only cue. */
    dot?: boolean;
    className?: string;
}

export function StatusChip({
    tone,
    children,
    icon: Icon,
    dot,
    className,
}: StatusChipProps): JSX.Element {
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1",
                TONE_TINT[tone],
                className,
            )}
        >
            {dot ? (
                <span className={cn("size-1.5 rounded-full", TONE_FILL[tone])} aria-hidden="true" />
            ) : null}
            {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
            {children}
        </span>
    );
}

export function ExamTypeChip({ type }: { type: ExamType }): JSX.Element {
    return (
        <StatusChip tone="muted" className="font-medium">
            {EXAM_TYPE_LABELS[type]}
        </StatusChip>
    );
}

/** "Today" / "Tomorrow" badge relative to the school's today; renders nothing otherwise. */
export function RelativeDayBadge({
    iso,
    today,
    prefix,
}: {
    iso: string;
    today: string;
    prefix?: string;
}): JSX.Element | null {
    const label = relativeDayLabel(iso, today);
    if (!label) {
        return null;
    }
    const text = prefix ? `${prefix} ${label.toLowerCase()}` : label;
    return (
        <StatusChip tone={label === "Today" ? "primary" : "info"} dot>
            {text}
        </StatusChip>
    );
}
