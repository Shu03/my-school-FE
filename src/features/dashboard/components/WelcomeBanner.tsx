import type { JSX } from "react";

import { useAuthStore } from "@features/auth";

interface WelcomeBannerProps {
    subtitle: string;
}

export function WelcomeBanner({ subtitle }: WelcomeBannerProps): JSX.Element {
    const user = useAuthStore((s) => s.user);

    return (
        <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
            <div className="from-primary/12 via-primary/5 border-border/60 border-b bg-linear-to-br to-transparent px-6 py-5">
                <h1 className="text-xl font-bold tracking-tight">
                    Welcome, {user?.firstName ?? "there"}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
            </div>
        </div>
    );
}
