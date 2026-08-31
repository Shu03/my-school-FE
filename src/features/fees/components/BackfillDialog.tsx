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

import type { BackfillResult } from "../types/fee.types";

interface BackfillDialogProps {
    open: boolean;
    isSubmitting: boolean;
    result: BackfillResult | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function BackfillDialog({
    open,
    isSubmitting,
    result,
    onOpenChange,
    onConfirm,
}: BackfillDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate fee records</DialogTitle>
                    <DialogDescription>
                        This creates fee records for enrolled students based on the fee structures
                        for the current academic year. Existing records are skipped.
                    </DialogDescription>
                </DialogHeader>

                {result && (
                    <div className="bg-muted/40 grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs">Created</p>
                            <p className="text-lg font-semibold tabular-nums">{result.created}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Skipped</p>
                            <p className="text-lg font-semibold tabular-nums">{result.skipped}</p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {result ? "Close" : "Cancel"}
                    </Button>
                    {!result && (
                        <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
                            {isSubmitting && <Spinner />}
                            Generate records
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
