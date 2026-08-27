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

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateAnnouncementFormValues>({
        resolver: zodResolver(createAnnouncementSchema),
        defaultValues: { title: "", content: "" },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            title: announcement?.title ?? "",
            content: announcement?.content ?? "",
        });
    }, [open, announcement, reset]);

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

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
