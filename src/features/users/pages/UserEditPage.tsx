import { useState } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Lock, UserRoundPen } from "lucide-react";
import { toast } from "sonner";

import { ROUTES } from "@constants/routes.constants";
import { ROLE_LABELS } from "@constants/users.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { Field } from "../components/Field";
import { ServerError } from "../components/UserFormFields";
import { FormFooter, FormSection, UserFormShell } from "../components/UserFormShell";
import { UserStatusBadge } from "../components/UserStatusBadge";
import { useUpdateUser, useUser } from "../hooks/useUsers";
import { getUserErrorMessage } from "../lib/errors";
import { emptyToUndefined } from "../lib/form";
import { updateUserSchema, type UpdateUserFormValues } from "../schemas/user.schema";
import type { UserWithProfiles } from "../types/user.types";

// TODO: add unsaved-changes guard to warn before navigating away with a dirty form.

export function UserEditPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { data: user, isLoading, isError } = useUser(id ?? null);

    return (
        <UserFormShell
            title="Edit user"
            description="Update the name or email. Mobile number and role cannot be changed."
            icon={<UserRoundPen className="size-5" />}
        >
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Spinner />
                </div>
            ) : isError || !user ? (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription>Could not load this user. Please try again.</AlertDescription>
                </Alert>
            ) : (
                <EditUserForm key={user.id} user={user} />
            )}
        </UserFormShell>
    );
}

function EditUserForm({ user }: { user: UserWithProfiles }): JSX.Element {
    const navigate = useNavigate();
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
            toast.success("User updated");
            navigate(ROUTES.USERS);
        } catch (error) {
            setServerError(getUserErrorMessage(error));
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
            <ServerError message={serverError} />

            <div className="border-border/60 bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-3">
                <span className="bg-primary/10 text-primary texture-sheen flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                </span>
                <div className="min-w-0">
                    <div className="truncate font-medium">
                        {user.firstName} {user.lastName}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                        {user.email ?? user.mobileNumber}
                    </div>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                    <span className="bg-primary/12 text-primary ring-primary/25 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1">
                        {ROLE_LABELS[user.role]}
                    </span>
                    <UserStatusBadge isActive={user.isActive} />
                </div>
            </div>

            <FormSection title="Profile">
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
            </FormSection>

            <FormSection title="Locked details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Mobile number" htmlFor="edit-mobile">
                        <div className="relative">
                            <Input id="edit-mobile" value={user.mobileNumber} disabled readOnly />
                            <Lock className="text-muted-foreground/70 pointer-events-none absolute inset-y-0 right-2.5 my-auto size-3.5" />
                        </div>
                    </Field>
                    <Field label="Role" htmlFor="edit-role">
                        <div className="relative">
                            <Input
                                id="edit-role"
                                value={ROLE_LABELS[user.role]}
                                disabled
                                readOnly
                            />
                            <Lock className="text-muted-foreground/70 pointer-events-none absolute inset-y-0 right-2.5 my-auto size-3.5" />
                        </div>
                    </Field>
                </div>
            </FormSection>

            <FormFooter>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => navigate(ROUTES.USERS)}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner />}
                    Save changes
                </Button>
            </FormFooter>
        </form>
    );
}
