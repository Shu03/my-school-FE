import type { JSX, ReactNode } from "react";

import { AlertCircle } from "lucide-react";

import { ROLE_LABELS } from "@constants/users.constants";

import { Role } from "@/types/api";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

function DetailRow({ label, children }: { label: string; children: ReactNode }): JSX.Element {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="text-right text-sm font-medium">{children}</span>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }): JSX.Element {
    return (
        <div className="flex flex-col">
            <p className="text-muted-foreground mb-1 text-xs font-medium tracking-widest uppercase">
                {title}
            </p>
            <div className="divide-border/60 divide-y">{children}</div>
        </div>
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>User details</DialogTitle>
                    <DialogDescription>Full account and profile information.</DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-10">
                        <Spinner />
                    </div>
                )}

                {isError && (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertDescription>
                            Could not load this user. Please try again.
                        </AlertDescription>
                    </Alert>
                )}

                {user && <UserDetailsBody user={user} />}
            </DialogContent>
        </Dialog>
    );
}

function UserDetailsBody({ user }: { user: UserWithProfiles }): JSX.Element {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full text-sm font-semibold">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                </div>
                <div className="min-w-0">
                    <p className="truncate font-semibold">
                        {user.firstName} {user.lastName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                        <UserStatusBadge isActive={user.isActive} />
                    </div>
                </div>
            </div>

            <Section title="Account">
                <DetailRow label="Mobile number">{user.mobileNumber}</DetailRow>
                <DetailRow label="Email">{user.email ?? "—"}</DetailRow>
                <DetailRow label="First login pending">
                    {user.isFirstLogin ? "Yes" : "No"}
                </DetailRow>
                <DetailRow label="Created">{formatDateTime(user.createdAt)}</DetailRow>
                <DetailRow label="Last updated">{formatDateTime(user.updatedAt)}</DetailRow>
                <DetailRow label="Password reset at">
                    {formatDateTime(user.resetPasswordAt)}
                </DetailRow>
            </Section>

            {user.role === Role.TEACHER && user.teacherProfile && (
                <Section title="Teacher profile">
                    <DetailRow label="Employee code">{user.teacherProfile.employeeCode}</DetailRow>
                    <DetailRow label="Joining date">
                        {formatDate(user.teacherProfile.joiningDate)}
                    </DetailRow>
                    <DetailRow label="Permission preset">
                        {user.teacherProfile.presetId ?? "—"}
                    </DetailRow>
                    <DetailRow label="Permission overrides">
                        {user.teacherProfile.permissionOverrides.length > 0
                            ? user.teacherProfile.permissionOverrides.join(", ")
                            : "—"}
                    </DetailRow>
                </Section>
            )}

            {user.role === Role.STUDENT && user.studentProfile && (
                <Section title="Student profile">
                    <DetailRow label="Admission number">
                        {user.studentProfile.admissionNumber}
                    </DetailRow>
                    <DetailRow label="Date of birth">
                        {formatDate(user.studentProfile.dateOfBirth)}
                    </DetailRow>
                </Section>
            )}
        </div>
    );
}
