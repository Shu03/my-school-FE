export function formatDate(isoDate: string): string {
    const value = new Date(isoDate);

    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    return value.toLocaleDateString();
}

export function toDateInputValue(isoDate: string): string {
    if (!isoDate) {
        return "";
    }

    return isoDate.slice(0, 10);
}
