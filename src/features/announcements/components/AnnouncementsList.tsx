import type { JSX } from "react";

import { CalendarClock, Megaphone, Pencil, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { formatDate, formatDateTime, getAnnouncementStatus } from "../lib/format";
import type { AnnouncementStatus } from "../lib/format";
import type { Announcement } from "../types/announcement.types";

const STATUS_META: Record<
    AnnouncementStatus,
    { label: string; variant: "success" | "warning" | "destructive"; heading: string }
> = {
    active: { label: "Active", variant: "success", heading: "Active" },
    upcoming: { label: "Upcoming", variant: "warning", heading: "Upcoming" },
    expired: { label: "Expired", variant: "destructive", heading: "Expired" },
};

const GROUP_ORDER: AnnouncementStatus[] = ["active", "upcoming", "expired"];

interface AnnouncementsListProps {
    announcements: Announcement[];
    isLoading: boolean;
    canManage: boolean;
    deletingAnnouncementId: string | null;
    onEdit: (announcement: Announcement) => void;
    onDelete: (announcement: Announcement) => void;
}

export function AnnouncementsList({
    announcements,
    isLoading,
    canManage,
    deletingAnnouncementId,
    onEdit,
    onDelete,
}: AnnouncementsListProps): JSX.Element {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10">
                <Spinner />
                <span className="text-muted-foreground text-sm">Loading announcements...</span>
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="text-muted-foreground py-10 text-center text-sm">
                No announcements yet.
            </div>
        );
    }

    const grouped = GROUP_ORDER.map((status) => ({
        status,
        items: announcements.filter(
            (a) => getAnnouncementStatus(a.startDate, a.endDate) === status,
        ),
    })).filter((group) => group.items.length > 0);

    function renderCard(announcement: Announcement, status: AnnouncementStatus): JSX.Element {
        const statusMeta = STATUS_META[status];
        const isExpired = status === "expired";

        return (
            <Card key={announcement.id} size="sm" className={isExpired ? "opacity-70" : undefined}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CardTitle className="flex flex-wrap items-center gap-2">
                            <Megaphone className="text-muted-foreground size-4 shrink-0" />
                            <span className="truncate">{announcement.title}</span>
                            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                        </CardTitle>
                        {announcement.createdBy && (
                            <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs">
                                <User className="size-3.5 shrink-0" />
                                <span>
                                    {announcement.createdBy.firstName}{" "}
                                    {announcement.createdBy.lastName}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{formatDateTime(announcement.createdAt)}</span>
                            </p>
                        )}
                    </div>
                    {canManage && !isExpired && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit ${announcement.title}`}
                                onClick={() => onEdit(announcement)}
                            >
                                <Pencil className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Delete ${announcement.title}`}
                                onClick={() => onDelete(announcement)}
                                disabled={deletingAnnouncementId === announcement.id}
                            >
                                {deletingAnnouncementId === announcement.id ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <Trash2 className="size-4" />
                                )}
                            </Button>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <div className="bg-muted/40 text-foreground/80 flex w-fit items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium">
                        <CalendarClock className="text-muted-foreground size-3.5 shrink-0" />
                        <span>{formatDate(announcement.startDate)}</span>
                        <span className="text-muted-foreground" aria-hidden="true">
                            &rarr;
                        </span>
                        <span>{formatDate(announcement.endDate)}</span>
                    </div>
                    <p className="text-foreground/90 border-l-2 pl-3 text-sm leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {grouped.map((group) => (
                <section key={group.status} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold">
                            {STATUS_META[group.status].heading}
                        </h2>
                        <Badge variant={STATUS_META[group.status].variant}>
                            {group.items.length}
                        </Badge>
                    </div>
                    {group.items.map((announcement) => renderCard(announcement, group.status))}
                </section>
            ))}
        </div>
    );
}
