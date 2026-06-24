import type { Permission } from "@constants/permissions.constants";

export function hasPermission(
    permissions: string[] | null | undefined,
    permission: Permission,
): boolean {
    if (!permissions || permissions.length === 0) {
        return false;
    }

    return permissions.includes(permission);
}

export function hasAnyPermission(
    permissions: string[] | null | undefined,
    requiredPermissions: Permission[],
): boolean {
    if (!requiredPermissions.length) {
        return true;
    }

    return requiredPermissions.some((permission) => hasPermission(permissions, permission));
}
