import { useEffect } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import {
    createAnnouncementSchema,
    type CreateAnnouncementFormValues,
} from "../schemas/announcement.schema";
import type { Announcement } from "../types/announcement.types";

interface AnnouncementFormDialogProps {
    open: boolean;
    announcement: Announcement | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateAnnouncementFormValues) => Promise<void>;
}

export function AnnouncementFormDialog({
    open,
    announcement,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: AnnouncementFormDialogProps): JSX.Element {
    const isEdit = Boolean(announcement);
    const today = new Date().toISOString().slice(0, 10);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<CreateAnnouncementFormValues>({
        resolver: zodResolver(createAnnouncementSchema),
        defaultValues: { title: "", content: "", startDate: "", endDate: "" },
    });

    const startDate = watch("startDate");

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            title: announcement?.title ?? "",
            content: announcement?.content ?? "",
            startDate: announcement?.startDate?.slice(0, 10) ?? "",
            endDate: announcement?.endDate?.slice(0, 10) ?? "",
        });
    }, [open, announcement, reset]);

    async function submit(values: CreateAnnouncementFormValues): Promise<void> {
        await onSubmit({
            ...values,
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit announcement" : "Create announcement"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the announcement title or content."
                            : "Post an announcement visible to all users."}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="School reopens on Monday"
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-destructive text-xs">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                min={isEdit ? undefined : today}
                                {...register("startDate")}
                            />
                            {errors.startDate && (
                                <p className="text-destructive text-xs">
                                    {errors.startDate.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                min={startDate || (isEdit ? undefined : today)}
                                {...register("endDate")}
                            />
                            {errors.endDate && (
                                <p className="text-destructive text-xs">{errors.endDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            rows={6}
                            placeholder="Write the announcement details..."
                            {...register("content")}
                        />
                        {errors.content && (
                            <p className="text-destructive text-xs">{errors.content.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            {isEdit ? "Save changes" : "Create announcement"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
