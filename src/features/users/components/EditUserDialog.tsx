import { useState } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { useUpdateUser } from "../hooks/useUsers";
import { getUserErrorMessage } from "../lib/errors";
import { updateUserSchema, type UpdateUserFormValues } from "../schemas/user.schema";
import type { User } from "../types/user.types";

import { Field } from "./Field";

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

/** Normalizes an optional text input: blank strings become `undefined`. */
function emptyToUndefined(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit user</DialogTitle>
                    <DialogDescription>
                        Update the name or email. Mobile number and role cannot be changed.
                    </DialogDescription>
                </DialogHeader>

                {user && <EditUserForm key={user.id} user={user} onOpenChange={onOpenChange} />}
            </DialogContent>
        </Dialog>
    );
}

interface EditUserFormProps {
    user: User;
    onOpenChange: (open: boolean) => void;
}

function EditUserForm({ user, onOpenChange }: EditUserFormProps): JSX.Element {
    const [serverError, setServerError] = useState<string | null>(null);
    const updateUser = useUpdateUser();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email ?? "",
        },
    });

    async function onSubmit(values: UpdateUserFormValues): Promise<void> {
        setServerError(null);
        try {
            await updateUser.mutateAsync({
                id: user.id,
                data: {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: emptyToUndefined(values.email),
                },
            });
            onOpenChange(false);
        } catch (error) {
            setServerError(getUserErrorMessage(error));
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            {serverError && (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                    label="First name"
                    htmlFor="edit-firstName"
                    required
                    error={errors.firstName?.message}
                >
                    <Input
                        id="edit-firstName"
                        autoComplete="given-name"
                        {...register("firstName")}
                    />
                </Field>
                <Field
                    label="Last name"
                    htmlFor="edit-lastName"
                    required
                    error={errors.lastName?.message}
                >
                    <Input
                        id="edit-lastName"
                        autoComplete="family-name"
                        {...register("lastName")}
                    />
                </Field>
            </div>
            <Field label="Email" htmlFor="edit-email" error={errors.email?.message}>
                <Input
                    id="edit-email"
                    type="email"
                    placeholder="Optional"
                    autoComplete="email"
                    {...register("email")}
                />
            </Field>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}
                    Save changes
                </Button>
            </DialogFooter>
        </form>
    );
}
