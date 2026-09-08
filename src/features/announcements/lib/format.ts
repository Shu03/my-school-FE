export function formatDateTime(isoDate: string): string {
    const value = new Date(isoDate);

    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    return value.toLocaleString();
}

export function formatDate(isoDate: string): string {
    const value = new Date(isoDate);

    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    return value.toLocaleDateString();
}

export type AnnouncementStatus = "upcoming" | "active" | "expired";

export function getAnnouncementStatus(startDate: string, endDate: string): AnnouncementStatus {
    const now = Date.now();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    if (now < start) {
        return "upcoming";
    }
    if (now > end) {
        return "expired";
    }
    return "active";
}
