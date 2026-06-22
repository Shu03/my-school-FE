import { useState } from "react";
import type { JSX } from "react";

import { AlertCircle } from "lucide-react";

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
import { Spinner } from "@/components/ui/spinner";

import { useDeactivateUser } from "../hooks/useUsers";
import { getUserErrorMessage } from "../lib/errors";
import type { User } from "../types/user.types";

interface DeactivateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function DeactivateUserDialog({
    open,
    onOpenChange,
    user,
}: DeactivateUserDialogProps): JSX.Element {
    const [serverError, setServerError] = useState<string | null>(null);
    const deactivateUser = useDeactivateUser();

    async function handleConfirm(): Promise<void> {
        if (!user) {
            return;
        }
        setServerError(null);
        try {
            await deactivateUser.mutateAsync(user.id);
            onOpenChange(false);
        } catch (error) {
            setServerError(getUserErrorMessage(error));
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Deactivate user?</DialogTitle>
                    <DialogDescription>
                        {user ? (
                            <>
                                {user.firstName} {user.lastName} will no longer be able to sign in.
                                Existing sessions remain active until their tokens expire. You can
                                reactivate the account later.
                            </>
                        ) : null}
                    </DialogDescription>
                </DialogHeader>

                {serverError && (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={deactivateUser.isPending}
                        onClick={handleConfirm}
                    >
                        {deactivateUser.isPending && <Spinner />}
                        Deactivate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
