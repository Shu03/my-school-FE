import { useState } from "react";
import type { JSX } from "react";

import { useTeachersList } from "@features/teachers";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface AssignTeacherDialogProps {
    open: boolean;
    title: string;
    description: string;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (teacherId: string) => Promise<void>;
}

export function AssignTeacherDialog({
    open,
    title,
    description,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: AssignTeacherDialogProps): JSX.Element {
    const { data: teachers = [], isLoading } = useTeachersList();
    const [teacherId, setTeacherId] = useState("");

    function handleOpenChange(next: boolean): void {
        if (!next) {
            setTeacherId("");
        }
        onOpenChange(next);
    }

    async function handleSubmit(): Promise<void> {
        if (!teacherId) {
            return;
        }
        await onSubmit(teacherId);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label>Teacher</Label>
                    <Select value={teacherId} onValueChange={setTeacherId} disabled={isLoading}>
                        <SelectTrigger aria-label="Select teacher">
                            <SelectValue
                                placeholder={isLoading ? "Loading teachers…" : "Select a teacher"}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.user.firstName} {teacher.user.lastName} (
                                    {teacher.employeeCode})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!isLoading && teachers.length === 0 && (
                        <p className="text-muted-foreground text-xs">No teachers available.</p>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={isSubmitting || !teacherId}
                        onClick={() => void handleSubmit()}
                    >
                        {isSubmitting && <Spinner />}
                        Assign
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
