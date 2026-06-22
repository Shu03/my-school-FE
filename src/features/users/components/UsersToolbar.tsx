import type { JSX } from "react";

import { Plus, Search } from "lucide-react";

import { CREATABLE_ROLES, ROLE_LABELS } from "@constants/users.constants";

import type { Role } from "@/types/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/** Sentinel value for "no filter" — Select items cannot use an empty string. */
export const ALL_FILTER = "all";

export type StatusFilter = typeof ALL_FILTER | "active" | "inactive";
export type RoleFilter = typeof ALL_FILTER | Role;

interface UsersToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    role: RoleFilter;
    onRoleChange: (value: RoleFilter) => void;
    status: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    onCreateClick: () => void;
}

export function UsersToolbar({
    search,
    onSearchChange,
    role,
    onRoleChange,
    status,
    onStatusChange,
    onCreateClick,
}: UsersToolbarProps): JSX.Element {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
                <Search className="text-muted-foreground absolute inset-y-0 left-2.5 my-auto size-4" />
                <Input
                    type="search"
                    placeholder="Search name or mobile"
                    aria-label="Search users"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select value={role} onValueChange={(value) => onRoleChange(value as RoleFilter)}>
                    <SelectTrigger className="w-34" aria-label="Filter by role">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_FILTER}>All roles</SelectItem>
                        {CREATABLE_ROLES.map((roleOption) => (
                            <SelectItem key={roleOption} value={roleOption}>
                                {ROLE_LABELS[roleOption]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={status}
                    onValueChange={(value) => onStatusChange(value as StatusFilter)}
                >
                    <SelectTrigger className="w-34" aria-label="Filter by status">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>

                <Button type="button" onClick={onCreateClick}>
                    <Plus />
                    Create user
                </Button>
            </div>
        </div>
    );
}
