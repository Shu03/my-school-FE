import type { JSX, ReactNode } from "react";

import { AlertCircle } from "lucide-react";

import { ROLE_LABELS } from "@constants/users.constants";

import { Role } from "@/types/api";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

import { useUser } from "../hooks/useUsers";
import { formatDate, formatDateTime } from "../lib/format";
import type { UserWithProfiles } from "../types/user.types";

import { UserStatusBadge } from "./UserStatusBadge";

interface UserDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
}

function Field({
    label,
    span,
    children,
}: {
    label: string;
    span?: boolean;
    children: ReactNode;
}): JSX.Element {
    return (
        <div className={span ? "col-span-2" : undefined}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-1 text-sm font-medium break-words">{children}</dd>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }): JSX.Element {
    return (
        <section>
            <div className="mb-4 flex items-center gap-3">
                <h3 className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                    {title}
                </h3>
                <span className="bg-border/70 h-px flex-1" aria-hidden="true" />
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5">{children}</dl>
        </section>
    );
}

export function UserDetailsDialog({
    open,
    onOpenChange,
    userId,
}: UserDetailsDialogProps): JSX.Element {
    const { data: user, isLoading, isError } = useUser(open ? userId : null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>User details</DialogTitle>
                    <DialogDescription>Full account and profile information.</DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Spinner />
                    </div>
                )}

                {isError && (
                    <div className="p-6">
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>
                                Could not load this user. Please try again.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {user && <UserDetailsBody user={user} />}
            </DialogContent>
        </Dialog>
    );
}

function UserDetailsBody({ user }: { user: UserWithProfiles }): JSX.Element {
    const subtitle = user.email ?? user.mobileNumber;

    return (
        <>
            {/* Banner */}
            <div className="from-primary/12 via-primary/5 border-border/60 relative border-b bg-gradient-to-br to-transparent px-6 pt-6 pb-5">
                <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground texture-sheen ring-primary/20 flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold shadow-sm ring-1">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-lg leading-tight font-semibold">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-muted-foreground mt-0.5 truncate text-sm">{subtitle}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="bg-primary/12 text-primary ring-primary/25 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1">
                                {ROLE_LABELS[user.role]}
                            </span>
                            <UserStatusBadge isActive={user.isActive} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex max-h-[65vh] flex-col gap-7 overflow-y-auto px-6 py-6">
                <Section title="Account">
                    <Field label="Mobile number">
                        <span className="tabular-nums">{user.mobileNumber}</span>
                    </Field>
                    <Field label="Email">{user.email ?? "Not provided"}</Field>
                    <Field label="First login">{user.isFirstLogin ? "Pending" : "Completed"}</Field>
                    <Field label="Password reset">{formatDateTime(user.resetPasswordAt)}</Field>
                    <Field label="Created">{formatDateTime(user.createdAt)}</Field>
                    <Field label="Last updated">{formatDateTime(user.updatedAt)}</Field>
                </Section>

                {user.role === Role.TEACHER && user.teacherProfile && (
                    <Section title="Teacher profile">
                        <Field label="Employee code">{user.teacherProfile.employeeCode}</Field>
                        <Field label="Joining date">
                            {formatDate(user.teacherProfile.joiningDate)}
                        </Field>
                        <Field label="Permission preset">
                            {user.teacherProfile.presetId ?? "None"}
                        </Field>
                        <Field label="Permission overrides" span>
                            {user.teacherProfile.permissionOverrides.length > 0
                                ? user.teacherProfile.permissionOverrides.join(", ")
                                : "None"}
                        </Field>
                    </Section>
                )}

                {user.role === Role.STUDENT && user.studentProfile && (
                    <Section title="Student profile">
                        <Field label="Admission number">
                            {user.studentProfile.admissionNumber}
                        </Field>
                        <Field label="Date of birth">
                            {formatDate(user.studentProfile.dateOfBirth)}
                        </Field>
                    </Section>
                )}

                {user.role === Role.ADMIN && (
                    <p className="text-muted-foreground text-sm">Full administrative access.</p>
                )}
            </div>
        </>
    );
}
