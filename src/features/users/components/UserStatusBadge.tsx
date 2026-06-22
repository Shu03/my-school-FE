import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
    isActive: boolean;
}

/** Visual indicator for a user's active/inactive account status. */
export function UserStatusBadge({ isActive }: UserStatusBadgeProps): JSX.Element {
    return (
        <Badge variant={isActive ? "secondary" : "outline"}>
            <span
                className={
                    isActive
                        ? "bg-primary size-1.5 rounded-full"
                        : "bg-muted-foreground size-1.5 rounded-full"
                }
            />
            {isActive ? "Active" : "Inactive"}
        </Badge>
    );
}
