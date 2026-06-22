import type { JSX } from "react";

import { Ban, CheckCircle2, MoreHorizontal, Pencil, UserRound } from "lucide-react";

import { ROLE_LABELS } from "@constants/users.constants";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { formatDate } from "../lib/format";
import type { User } from "../types/user.types";

import { UserStatusBadge } from "./UserStatusBadge";

interface UsersTableProps {
    users: User[];
    isLoading: boolean;
    onView: (user: User) => void;
    onEdit: (user: User) => void;
    onActivate: (user: User) => void;
    onDeactivate: (user: User) => void;
}

export function UsersTable({
    users,
    isLoading,
    onView,
    onEdit,
    onActivate,
    onDeactivate,
}: UsersTableProps): JSX.Element {
    return (
        <div className="overflow-hidden rounded-xl border">
            <Table>
                <TableHeader>
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
                            <TableRow key={user.id} className={user.isActive ? "" : "opacity-60"}>
                                <TableCell>
                                    <div className="font-medium">
                                        {user.firstName} {user.lastName}
                                    </div>
                                    {user.email && (
                                        <div className="text-muted-foreground text-xs">
                                            {user.email}
                                        </div>
                                    )}
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
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Actions for ${user.firstName} ${user.lastName}`}
                                            >
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => onView(user)}>
                                                <UserRound />
                                                View details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => onEdit(user)}>
                                                <Pencil />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {user.isActive ? (
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={() => onDeactivate(user)}
                                                >
                                                    <Ban />
                                                    Deactivate
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onSelect={() => onActivate(user)}>
                                                    <CheckCircle2 />
                                                    Activate
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
