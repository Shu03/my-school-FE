import { toPaise } from "./format";

/** The API can change optional text but not clear it once set. */
export const CLEAR_TEXT_MESSAGE = "Saved text can't be emptied. Enter a replacement instead.";

export function isClearingText(next: string, previous: string | null): boolean {
    return next.trim() === "" && Boolean(previous);
}

/** Trimmed value when it differs from what's saved, otherwise `undefined`. */
export function changedText(next: string, previous: string | null): string | undefined {
    const trimmed = next.trim();
    return trimmed !== "" && trimmed !== (previous ?? "") ? trimmed : undefined;
}

export function changedAmount(next: number, previous: number): number | undefined {
    return toPaise(next) !== toPaise(previous) ? next : undefined;
}

export function changedValue<T>(next: T, previous: T): T | undefined {
    return next !== previous ? next : undefined;
}

/** Drops `undefined` keys so only documented, changed fields are sent. */
export function compact<T extends object>(value: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(value).filter(([, entry]) => entry !== undefined),
    ) as Partial<T>;
}

/** Optional text for create payloads: omitted entirely when blank. */
export function optionalText(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
}
