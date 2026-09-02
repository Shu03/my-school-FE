import type { JSX, ReactNode } from "react";

import { AlertTriangle } from "lucide-react";

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

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    isPending?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    isPending = false,
    onOpenChange,
    onConfirm,
}: ConfirmDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="bg-destructive/10 text-destructive mb-1 flex size-10 items-center justify-center rounded-lg">
                        <AlertTriangle className="size-5" />
                    </div>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {isPending ? <Spinner /> : null}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
