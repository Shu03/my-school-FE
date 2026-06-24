import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

import type { AcademicYear } from "../types/academic-year.types";

interface SetCurrentYearDialogProps {
    open: boolean;
    year: AcademicYear | null;
    isSubmitting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
}

export function SetCurrentYearDialog({
    open,
    year,
    isSubmitting,
    onOpenChange,
    onConfirm,
}: SetCurrentYearDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set current academic year</DialogTitle>
                    <DialogDescription>
                        {year
                            ? `Make ${year.name} the current academic year?`
                            : "Make this academic year current?"}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={() => void onConfirm()} disabled={isSubmitting}>
                        {isSubmitting && <Spinner />}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
