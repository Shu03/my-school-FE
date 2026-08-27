import { useState } from "react";
import type { JSX } from "react";

import { AlertCircle, Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";

import { ANNOUNCEMENT_PAGINATION } from "@constants/announcements.constants";
import { PERMISSIONS } from "@constants/permissions.constants";

import { Role } from "@/types/api";

import { hasPermission, useAuthStore } from "@features/auth";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { AnnouncementFormDialog } from "../components/AnnouncementFormDialog";
import { AnnouncementsList } from "../components/AnnouncementsList";
import { AnnouncementsPagination } from "../components/AnnouncementsPagination";
import {
    useAnnouncementsList,
    useCreateAnnouncement,
    useDeleteAnnouncement,
    useUpdateAnnouncement,
} from "../hooks/useAnnouncements";
import { getAnnouncementErrorMessage } from "../lib/errors";
import type { CreateAnnouncementFormValues } from "../schemas/announcement.schema";
import type { Announcement } from "../types/announcement.types";

export function AnnouncementsPage(): JSX.Element {
    const user = useAuthStore((s) => s.user);
    const canManage =
        user?.role === Role.ADMIN ||
        hasPermission(user?.permissions, PERMISSIONS.ANNOUNCEMENTS_MANAGE);

    const [page, setPage] = useState<number>(ANNOUNCEMENT_PAGINATION.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(ANNOUNCEMENT_PAGINATION.DEFAULT_LIMIT);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Announcement | null>(null);

    const { data, isLoading, isError, refetch } = useAnnouncementsList({ page, limit });
    const announcements = data?.data ?? [];
    const total = data?.total ?? 0;

    const createMutation = useCreateAnnouncement();
    const updateMutation = useUpdateAnnouncement();
    const deleteMutation = useDeleteAnnouncement();

    function handleCreate(): void {
        setEditing(null);
        setFormOpen(true);
    }

    function handleEdit(announcement: Announcement): void {
        setEditing(announcement);
        setFormOpen(true);
    }

    function handleLimitChange(value: number): void {
        setLimit(value);
        setPage(1);
    }

    async function handleDelete(announcement: Announcement): Promise<void> {
        const confirmed = window.confirm(
            `Delete "${announcement.title}"? This action cannot be undone.`,
        );
        if (!confirmed) {
            return;
        }

        try {
            await deleteMutation.mutateAsync({ id: announcement.id });
            toast.success("Announcement deleted successfully.");
        } catch (error) {
            toast.error(getAnnouncementErrorMessage(error));
        }
    }

    async function handleFormSubmit(values: CreateAnnouncementFormValues): Promise<void> {
        try {
            if (editing) {
                await updateMutation.mutateAsync({ id: editing.id, data: values });
                toast.success("Announcement updated successfully.");
            } else {
                await createMutation.mutateAsync(values);
                toast.success("Announcement created successfully.");
            }

            setFormOpen(false);
            setEditing(null);
        } catch (error) {
            toast.error(getAnnouncementErrorMessage(error));
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="border-border/60 from-primary/12 via-primary/5 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                                <Megaphone className="size-5" />
                                Announcements
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                School-wide announcements and updates.
                            </p>
                        </div>
                        {canManage && (
                            <Button onClick={handleCreate}>
                                <Plus className="size-4" />
                                New announcement
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 px-6 py-6">
                    {isError ? (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span>Could not load announcements. Please try again.</span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void refetch()}
                                >
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <AnnouncementsList
                                announcements={announcements}
                                isLoading={isLoading}
                                canManage={canManage}
                                deletingAnnouncementId={
                                    deleteMutation.isPending
                                        ? (deleteMutation.variables?.id ?? null)
                                        : null
                                }
                                onEdit={handleEdit}
                                onDelete={(announcement) => void handleDelete(announcement)}
                            />
                            <AnnouncementsPagination
                                page={page}
                                limit={limit}
                                total={total}
                                onPageChange={setPage}
                                onLimitChange={handleLimitChange}
                            />
                        </>
                    )}
                </div>
            </div>

            <AnnouncementFormDialog
                open={formOpen}
                announcement={editing}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onOpenChange={setFormOpen}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}
