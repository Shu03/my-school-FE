import type { JSX } from "react";

import { cn } from "@/lib/utils";

import { percentTone, type Tone } from "../lib/format";
import { TONE_FILL, TONE_STROKE, TONE_TEXT } from "../lib/tone";

interface ProgressBarProps {
    /** 0–100 */
    value: number;
    label: string;
    tone?: Tone;
    className?: string;
}

export function ProgressBar({
    value,
    label,
    tone = "primary",
    className,
}: ProgressBarProps): JSX.Element {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clamped}
            className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}
        >
            <div
                className={cn(
                    "h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none",
                    TONE_FILL[tone],
                )}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
}

interface PercentRingProps {
    /** 0–100, or null when there is nothing to measure yet. */
    value: number | null;
    label: string;
    tone?: Tone;
    size?: number;
    strokeWidth?: number;
    caption?: string;
}

const DEFAULT_RING_SIZE = 112;
const DEFAULT_RING_STROKE = 10;
/** Below this size the centre label switches to compact type. */
const COMPACT_RING_SIZE = 80;

/** Donut meter; shows "—" when `value` is null so a missing reading never reads as 0%. */
export function PercentRing({
    value,
    label,
    tone,
    size = DEFAULT_RING_SIZE,
    strokeWidth = DEFAULT_RING_STROKE,
    caption,
}: PercentRingProps): JSX.Element {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = value === null ? 0 : Math.min(100, Math.max(0, value));
    const resolvedTone: Tone = value === null ? "muted" : (tone ?? percentTone(clamped));
    const offset = circumference * (1 - clamped / 100);

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value === null ? undefined : clamped}
            aria-valuetext={value === null ? "Not available" : `${clamped}%`}
            className="relative inline-flex shrink-0 items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    className="stroke-muted"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={cn(
                        "transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none",
                        TONE_STROKE[resolvedTone],
                    )}
                />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className={cn(
                        "font-bold tracking-tight tabular-nums",
                        size < COMPACT_RING_SIZE ? "text-sm" : "text-2xl",
                        TONE_TEXT[resolvedTone],
                    )}
                >
                    {value === null ? "—" : `${clamped}%`}
                </span>
                {caption ? (
                    <span className="text-muted-foreground text-[0.65rem] font-medium tracking-wide uppercase">
                        {caption}
                    </span>
                ) : null}
            </span>
        </div>
    );
}
