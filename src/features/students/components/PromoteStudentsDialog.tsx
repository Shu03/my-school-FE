import { useState } from "react";
import type { JSX } from "react";

import { TriangleAlert } from "lucide-react";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useClassesList } from "@features/classes";

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

interface PromoteStudentsDialogProps {
    open: boolean;
    selectedCount: number;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (targetClassId: string) => Promise<void>;
}

export function PromoteStudentsDialog({
    open,
    selectedCount,
    isSubmitting,
    onOpenChange,
    onSubmit,
}: PromoteStudentsDialogProps): JSX.Element {
    const [targetClassId, setTargetClassId] = useState("");
    const [wasOpen, setWasOpen] = useState(open);

    const { data: currentYear } = useCurrentAcademicYear();
    const { data: classes = [] } = useClassesList(
        { academicYearId: currentYear?.id },
        Boolean(currentYear?.id),
    );

    // Reset the selection whenever the dialog closes (render-time sync).
    if (open !== wasOpen) {
        setWasOpen(open);
        if (!open) {
            setTargetClassId("");
        }
    }

    async function handleConfirm(): Promise<void> {
        if (!targetClassId) {
            return;
        }

        await onSubmit(targetClassId);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Promote students</DialogTitle>
                    <DialogDescription>
                        Enroll {selectedCount} selected{" "}
                        {selectedCount === 1 ? "student" : "students"} into a target class for{" "}
                        {currentYear?.name ?? "the current year"}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-muted/40 text-muted-foreground flex gap-2 rounded-lg border p-3 text-sm">
                        <TriangleAlert className="size-4 shrink-0 text-amber-500" />
                        <span>
                            Students already enrolled in the target year will be skipped. This
                            action creates new enrollments and cannot be undone automatically.
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label>Target class</Label>
                        <Select value={targetClassId} onValueChange={setTargetClassId}>
                            <SelectTrigger aria-label="Select target class">
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name} (Grade {item.gradeLevel})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={isSubmitting || !targetClassId}
                        onClick={handleConfirm}
                    >
                        {isSubmitting && <Spinner />}
                        Promote
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
