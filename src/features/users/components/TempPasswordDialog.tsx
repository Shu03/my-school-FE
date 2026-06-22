import { useState } from "react";
import type { JSX } from "react";

import { Check, Copy, KeyRound } from "lucide-react";

import { ROLE_LABELS } from "@constants/users.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import type { User } from "../types/user.types";

interface TempPasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
    tempPassword: string | null;
}

/**
 * Shown once after a user is created. Displays the temporary password
 * (returned only at creation time) so the admin can share it out-of-band.
 */
export function TempPasswordDialog({
    open,
    onOpenChange,
    user,
    tempPassword,
}: TempPasswordDialogProps): JSX.Element | null {
    const [copied, setCopied] = useState(false);

    if (!user || !tempPassword) {
        return null;
    }

    async function handleCopy(): Promise<void> {
        if (!tempPassword) {
            return;
        }
        try {
            await navigator.clipboard.writeText(tempPassword);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="size-4" />
                        Account created
                    </DialogTitle>
                    <DialogDescription>
                        {ROLE_LABELS[user.role]} {user.firstName} {user.lastName} can sign in with
                        their mobile number and this temporary password.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                        <code className="font-mono text-sm tracking-wide select-all">
                            {tempPassword}
                        </code>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            aria-label="Copy temporary password"
                        >
                            {copied ? (
                                <Check className="size-3.5" />
                            ) : (
                                <Copy className="size-3.5" />
                            )}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                    </div>

                    <Alert>
                        <AlertDescription>
                            This password is shown only once. Share it securely — the user will be
                            asked to set a new password on first sign-in.
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button type="button" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
