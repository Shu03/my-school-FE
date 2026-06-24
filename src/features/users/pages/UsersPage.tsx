import { useEffect, useState } from "react";
import type { JSX } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { ROUTES, userEdit } from "@constants/routes.constants";
import { USER_PAGINATION } from "@constants/users.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { DeactivateUserDialog } from "../components/DeactivateUserDialog";
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
import { useActivateUser, useResetUserPassword, useUsersList } from "../hooks/useUsers";
import { getUserErrorMessage } from "../lib/errors";
import type { User, UserListParams } from "../types/user.types";

const SEARCH_DEBOUNCE_MS = 350;

/** Navigation state set by the create page after a user is created. */
interface CreatedUserState {
    createdUser: User;
    tempPassword: string;
}

function isCreatedUserState(value: unknown): value is CreatedUserState {
    return (
        typeof value === "object" &&
        value !== null &&
        "createdUser" in value &&
        "tempPassword" in value
    );
}

export function UsersPage(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();

    // Filters
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>(ALL_FILTER);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_FILTER);
    const [page, setPage] = useState<number>(USER_PAGINATION.DEFAULT_PAGE);
    const [limit, setLimit] = useState<number>(USER_PAGINATION.DEFAULT_LIMIT);

    // Dialog state. The temp-password dialog is seeded from navigation state set by
    // the create page (read once on mount) so it pops after a successful create.
    const [tempPasswordOpen, setTempPasswordOpen] = useState(() =>
        isCreatedUserState(location.state),
    );
    const [createdUser] = useState<User | null>(() =>
        isCreatedUserState(location.state) ? location.state.createdUser : null,
    );
    const [tempPassword] = useState<string | null>(() =>
        isCreatedUserState(location.state) ? location.state.tempPassword : null,
    );
    const [viewUserId, setViewUserId] = useState<string | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [resetTarget, setResetTarget] = useState<User | null>(null);
    const [resetTempPassword, setResetTempPassword] = useState<string | null>(null);
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);

    const activateUser = useActivateUser();
    const resetUserPassword = useResetUserPassword();

    // Clear the navigation state once consumed so a refresh doesn't reopen the dialog.
    useEffect(() => {
        if (isCreatedUserState(location.state)) {
            navigate(ROUTES.USERS, { replace: true, state: null });
        }
    }, [location.state, navigate]);

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

    function handleEdit(user: User): void {
        navigate(userEdit(user.id));
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

    async function handleResetPassword(user: User): Promise<void> {
        setResetPasswordUserId(user.id);
        try {
            const result = await resetUserPassword.mutateAsync({ userId: user.id });
            setResetTarget(user);
            setResetTempPassword(result.tempPassword);
            setResetPasswordOpen(true);
        } catch (error) {
            toast.error(getUserErrorMessage(error));
        } finally {
            setResetPasswordUserId(null);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <UsersToolbar
                search={searchInput}
                onSearchChange={setSearchInput}
                role={roleFilter}
                onRoleChange={handleRoleChange}
                status={statusFilter}
                onStatusChange={handleStatusChange}
                onCreateClick={() => navigate(ROUTES.USER_NEW)}
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
                        resetPasswordUserId={resetPasswordUserId}
                        onView={handleView}
                        onEdit={handleEdit}
                        onActivate={handleActivate}
                        onDeactivate={handleDeactivate}
                        onResetPassword={(user) => void handleResetPassword(user)}
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

            <TempPasswordDialog
                open={tempPasswordOpen}
                onOpenChange={setTempPasswordOpen}
                user={createdUser}
                tempPassword={tempPassword}
            />
            <TempPasswordDialog
                open={resetPasswordOpen}
                onOpenChange={setResetPasswordOpen}
                user={resetTarget}
                tempPassword={resetTempPassword}
                mode="reset"
            />
            <UserDetailsDialog
                open={viewOpen}
                onOpenChange={setViewOpen}
                userId={viewUserId}
                resetPasswordUserId={resetPasswordUserId}
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
            />
            <DeactivateUserDialog
                open={deactivateOpen}
                onOpenChange={setDeactivateOpen}
                user={deactivateTarget}
            />
        </div>
    );
}
