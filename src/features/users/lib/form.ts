/** Normalizes an optional text input: blank strings become `undefined`. */
export function emptyToUndefined(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}
