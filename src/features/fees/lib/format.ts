export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
}

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
