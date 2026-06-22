import { useEffect, useState } from "react";
import type { JSX } from "react";

import { AlertCircle } from "lucide-react";

import { USER_PAGINATION } from "@constants/users.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { CreateUserDialog } from "../components/CreateUserDialog";
import { DeactivateUserDialog } from "../components/DeactivateUserDialog";
import { EditUserDialog } from "../components/EditUserDialog";
import { TempPasswordDialog } from "../components/TempPasswordDialog";
import { UserDetailsDialog } from "../components/UserDetailsDialog";
import { UsersPagination } from "../components/UsersPagination";
import { UsersTable } from "../components/UsersTable";
import {
    ALL_FILTER,
    UsersToolbar,
    type RoleFilter,
    type StatusFilter,
} from "../components/UsersToolbar";
import { useActivateUser, useUsersList } from "../hooks/useUsers";
import type { User, UserListParams } from "../types/user.types";

const SEARCH_DEBOUNCE_MS = 350;

export function UsersPage(): JSX.Element {
    // Filters
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>(ALL_FILTER);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_FILTER);
    const [page, setPage] = useState<number>(USER_PAGINATION.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(USER_PAGINATION.DEFAULT_LIMIT);

    // Dialog state
    const [createOpen, setCreateOpen] = useState(false);
    const [tempPasswordOpen, setTempPasswordOpen] = useState(false);
    const [createdUser, setCreatedUser] = useState<User | null>(null);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [viewUserId, setViewUserId] = useState<string | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
    const [deactivateOpen, setDeactivateOpen] = useState(false);

    const activateUser = useActivateUser();

    // Debounce search input; resetting to the first page happens here too.
    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(handle);
    }, [searchInput]);

    function handleRoleChange(value: RoleFilter): void {
        setRoleFilter(value);
        setPage(1);
    }

    function handleStatusChange(value: StatusFilter): void {
        setStatusFilter(value);
        setPage(1);
    }

    function handleLimitChange(value: number): void {
        setLimit(value);
        setPage(1);
    }

    const params: UserListParams = {
        page,
        limit,
        search: debouncedSearch || undefined,
        role: roleFilter === ALL_FILTER ? undefined : roleFilter,
        isActive: statusFilter === ALL_FILTER ? undefined : statusFilter === "active",
    };

    const { data, isLoading, isError, refetch } = useUsersList(params);
    const users = data?.data ?? [];
    const total = data?.total ?? 0;

    function handleCreated(user: User, password: string): void {
        setCreateOpen(false);
        setCreatedUser(user);
        setTempPassword(password);
        setTempPasswordOpen(true);
    }

    function handleEdit(user: User): void {
        setEditUser(user);
        setEditOpen(true);
    }

    function handleView(user: User): void {
        setViewUserId(user.id);
        setViewOpen(true);
    }

    function handleDeactivate(user: User): void {
        setDeactivateTarget(user);
        setDeactivateOpen(true);
    }

    function handleActivate(user: User): void {
        activateUser.mutate(user.id);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground text-sm">
                    Create and manage admin, teacher, and student accounts.
                </p>
            </div>

            <UsersToolbar
                search={searchInput}
                onSearchChange={setSearchInput}
                role={roleFilter}
                onRoleChange={handleRoleChange}
                status={statusFilter}
                onStatusChange={handleStatusChange}
                onCreateClick={() => setCreateOpen(true)}
            />

            {isError ? (
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertDescription className="flex items-center justify-between gap-4">
                        <span>Could not load users. Please try again.</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void refetch()}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    <UsersTable
                        users={users}
                        isLoading={isLoading}
                        onView={handleView}
                        onEdit={handleEdit}
                        onActivate={handleActivate}
                        onDeactivate={handleDeactivate}
                    />
                    <UsersPagination
                        page={page}
                        limit={limit}
                        total={total}
                        onPageChange={setPage}
                        onLimitChange={handleLimitChange}
                    />
                </>
            )}

            <CreateUserDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={handleCreated}
            />
            <TempPasswordDialog
                open={tempPasswordOpen}
                onOpenChange={setTempPasswordOpen}
                user={createdUser}
                tempPassword={tempPassword}
            />
            <EditUserDialog open={editOpen} onOpenChange={setEditOpen} user={editUser} />
            <UserDetailsDialog open={viewOpen} onOpenChange={setViewOpen} userId={viewUserId} />
            <DeactivateUserDialog
                open={deactivateOpen}
                onOpenChange={setDeactivateOpen}
                user={deactivateTarget}
            />
        </div>
    );
}
