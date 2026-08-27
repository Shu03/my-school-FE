export function formatDateTime(isoDate: string): string {
    const value = new Date(isoDate);

    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    return value.toLocaleString();
}
