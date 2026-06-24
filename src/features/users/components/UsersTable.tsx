import type { JSX } from "react";

import { Ban, CheckCircle2, KeyRound, Pencil } from "lucide-react";

import { ROLE_LABELS } from "@constants/users.constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { formatDate } from "../lib/format";
import type { User } from "../types/user.types";

import { UserStatusBadge } from "./UserStatusBadge";

interface UsersTableProps {
    users: User[];
    isLoading: boolean;
    resetPasswordUserId: string | null;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onActivate: (user: User) => void;
    onDeactivate: (user: User) => void;
    onResetPassword: (user: User) => void;
}

export function UsersTable({
    users,
    isLoading,
    resetPasswordUserId,
    onView,
    onEdit,
    onActivate,
    onDeactivate,
    onResetPassword,
}: UsersTableProps): JSX.Element {
    return (
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            <Table>
                <TableHeader className="bg-muted/40 [&_th]:text-muted-foreground [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase">
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-12 text-right">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="flex items-center justify-center gap-2 py-10">
                                    <Spinner />
                                    <span className="text-muted-foreground text-sm">
                                        Loading users…
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading && users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="text-muted-foreground py-10 text-center text-sm">
                                    No users match your filters.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        users.map((user) => (
                            <TableRow
                                key={user.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`View details for ${user.firstName} ${user.lastName}`}
                                onClick={() => onView(user)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onView(user);
                                    }
                                }}
                                className={cn(
                                    "hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-ring/40 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset",
                                    !user.isActive && "opacity-60",
                                )}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                            {user.firstName?.[0]}
                                            {user.lastName?.[0]}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            {user.email && (
                                                <div className="text-muted-foreground truncate text-xs">
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="tabular-nums">{user.mobileNumber}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                                </TableCell>
                                <TableCell>
                                    <UserStatusBadge isActive={user.isActive} />
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDate(user.createdAt)}
                                </TableCell>
                                <TableCell
                                    className="text-right"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild className="cursor-pointer">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={resetPasswordUserId === user.id}
                                                    aria-label={`Reset password for ${user.firstName} ${user.lastName}`}
                                                    className="text-warning hover:bg-warning/10 hover:text-warning"
                                                    onClick={() => onResetPassword(user)}
                                                >
                                                    {resetPasswordUserId === user.id ? (
                                                        <Spinner className="size-4" />
                                                    ) : (
                                                        <KeyRound className="size-4" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Reset password</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild className="cursor-pointer">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit ${user.firstName} ${user.lastName}`}
                                                    className="text-info hover:bg-info/10 hover:text-info"
                                                    onClick={() => onEdit(user)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit</TooltipContent>
                                        </Tooltip>

                                        {user.isActive ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild className="cursor-pointer">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Deactivate ${user.firstName} ${user.lastName}`}
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => onDeactivate(user)}
                                                    >
                                                        <Ban className="size-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Deactivate</TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip>
                                                <TooltipTrigger asChild className="cursor-pointer">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Activate ${user.firstName} ${user.lastName}`}
                                                        className="text-success hover:bg-success/10 hover:text-success"
                                                        onClick={() => onActivate(user)}
                                                    >
                                                        <CheckCircle2 className="size-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Activate</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
