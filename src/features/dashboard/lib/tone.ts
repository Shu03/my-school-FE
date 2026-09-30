import type { FeeStatus } from "@constants/fees.constants";

import type { Tone } from "./format";

export const FEE_STATUS_TONE: Record<FeeStatus, Tone> = {
    PENDING: "warning",
    PARTIAL: "info",
    PAID: "success",
};

/** Tinted chip / tile surface per tone. */
export const TONE_TINT: Record<Tone, string> = {
    success: "bg-success/12 text-success ring-success/25",
    warning: "bg-warning/12 text-warning ring-warning/25",
    destructive: "bg-destructive/10 text-destructive ring-destructive/25",
    info: "bg-info/12 text-info ring-info/25",
    primary: "bg-primary/12 text-primary ring-primary/25",
    muted: "bg-muted text-muted-foreground ring-border",
};

/** Solid fill for bars and dots. */
export const TONE_FILL: Record<Tone, string> = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
    info: "bg-info",
    primary: "bg-primary",
    muted: "bg-muted-foreground/40",
};

export const TONE_TEXT: Record<Tone, string> = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-info",
    primary: "text-primary",
    muted: "text-muted-foreground",
};

export const TONE_STROKE: Record<Tone, string> = {
    success: "stroke-success",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
    info: "stroke-info",
    primary: "stroke-primary",
    muted: "stroke-muted-foreground/40",
};
