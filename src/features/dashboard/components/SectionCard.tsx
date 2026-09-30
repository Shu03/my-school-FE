import { useId } from "react";
import type { ComponentType, JSX, ReactNode } from "react";

import { Link } from "react-router-dom";

import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string }>;

interface SectionCardProps {
    icon: IconType;
    title: string;
    description?: string;
    action?: { label: string; to: string };
    /** Extra header content (badges) rendered next to the action. */
    headerExtra?: ReactNode;
    className?: string;
    bodyClassName?: string;
    children: ReactNode;
}

/** Titled dashboard panel with gradient header, optional "View all" link and body. */
export function SectionCard({
    icon: Icon,
    title,
    description,
    action,
    headerExtra,
    className,
    bodyClassName,
    children,
}: SectionCardProps): JSX.Element {
    const headingId = useId();

    return (
        <section
            aria-labelledby={headingId}
            className={cn(
                "bg-card text-card-foreground ring-foreground/10 texture-grain flex flex-col overflow-hidden rounded-xl shadow-sm ring-1",
                className,
            )}
        >
            <div className="border-border/60 from-primary/10 via-primary/5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b bg-linear-to-br to-transparent px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-9 shrink-0 items-center justify-center rounded-xl ring-1">
                        <Icon className="size-[1.1rem]" />
                    </span>
                    <div className="min-w-0">
                        <h2
                            id={headingId}
                            className="truncate text-sm font-semibold tracking-tight"
                        >
                            {title}
                        </h2>
                        {description ? (
                            <p className="text-muted-foreground truncate text-xs">{description}</p>
                        ) : null}
                    </div>
                </div>
                {headerExtra || action ? (
                    <div className="flex shrink-0 items-center gap-3">
                        {headerExtra}
                        {action ? (
                            <Link
                                to={action.to}
                                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 group inline-flex items-center gap-1 rounded-sm text-xs font-medium transition-colors outline-none focus-visible:ring-2"
                            >
                                {action.label}
                                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                            </Link>
                        ) : null}
                    </div>
                ) : null}
            </div>
            <div className={cn("flex-1 px-5 py-4", bodyClassName)}>{children}</div>
        </section>
    );
}

interface EmptyStateProps {
    icon: IconType;
    message: string;
    hint?: string;
    className?: string;
    children?: ReactNode;
}

/** Quiet placeholder so a widget never renders as a blank card. */
export function EmptyState({
    icon: Icon,
    message,
    hint,
    className,
    children,
}: EmptyStateProps): JSX.Element {
    return (
        <div
            className={cn(
                "border-border/70 bg-muted/20 flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center",
                className,
            )}
        >
            <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
                <Icon className="size-5" />
            </span>
            <p className="text-sm font-medium">{message}</p>
            {hint ? <p className="text-muted-foreground max-w-xs text-xs">{hint}</p> : null}
            {children}
        </div>
    );
}
