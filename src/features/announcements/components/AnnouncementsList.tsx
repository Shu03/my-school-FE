import type { JSX } from "react";

import { Megaphone, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { formatDateTime } from "../lib/format";
import type { Announcement } from "../types/announcement.types";

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

    return (
        <div className="flex flex-col gap-3">
            {announcements.map((announcement) => (
                <Card key={announcement.id} size="sm">
                    <CardHeader className="flex flex-row items-start justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="text-muted-foreground size-4" />
                                {announcement.title}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {announcement.createdBy
                                    ? `${announcement.createdBy.firstName} ${announcement.createdBy.lastName} · `
                                    : ""}
                                {formatDateTime(announcement.createdAt)}
                            </p>
                        </div>
                        {canManage && (
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
                    <CardContent className="text-muted-foreground text-sm whitespace-pre-wrap">
                        {announcement.content}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
