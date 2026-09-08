import type { JSX, ReactNode } from "react";

import { Link } from "react-router-dom";

import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: { label: string; to: string };
    className?: string;
    children: ReactNode;
}

/** Titled panel matching the app's gradient-header card shell, used for dashboard groups. */
export function DashboardSection({
    icon: Icon,
    title,
    description,
    action,
    className,
    children,
}: DashboardSectionProps): JSX.Element {
    return (
        <Card className={cn("gap-0 overflow-hidden p-0", className)}>
            <div className="border-border/60 from-primary/10 via-primary/5 flex items-center justify-between gap-3 border-b bg-linear-to-br to-transparent px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-9 shrink-0 items-center justify-center rounded-xl ring-1">
                        <Icon className="size-[1.1rem]" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
                        {description ? (
                            <p className="text-muted-foreground text-xs">{description}</p>
                        ) : null}
                    </div>
                </div>
                {action ? (
                    <Link
                        to={action.to}
                        className="text-muted-foreground hover:text-foreground group inline-flex shrink-0 items-center gap-1 text-xs font-medium transition-colors"
                    >
                        {action.label}
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                ) : null}
            </div>
            <div className="px-5 py-4">{children}</div>
        </Card>
    );
}
