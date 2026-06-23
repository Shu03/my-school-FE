import type { JSX, ReactNode } from "react";

import { Link } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { ROUTES } from "@constants/routes.constants";

interface UserFormShellProps {
    title: string;
    description: string;
    /** Icon node rendered inside the header tile (e.g. a lucide icon or initials). */
    icon: ReactNode;
    children: ReactNode;
}

/** Page chrome shared by the create and edit user pages: back link, branded header and body. */
export function UserFormShell({
    title,
    description,
    icon,
    children,
}: UserFormShellProps): JSX.Element {
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <Link
                to={ROUTES.USERS}
                className="text-muted-foreground hover:text-foreground group inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors"
            >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                Back to users
            </Link>

            <div className="bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl shadow-sm ring-1">
                <div className="from-primary/12 via-primary/5 border-border/60 flex items-center gap-4 border-b bg-linear-to-br to-transparent px-6 py-5">
                    <span className="bg-primary/12 text-primary ring-primary/25 texture-sheen flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ring-1">
                        {icon}
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                </div>

                <div className="px-6 py-6">{children}</div>
            </div>
        </div>
    );
}

/** A labeled form section with a subtle uppercase header and hairline rule. */
export function FormSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}): JSX.Element {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <h2 className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
                    {title}
                </h2>
                <span className="bg-border/70 h-px flex-1" aria-hidden="true" />
            </div>
            {children}
        </section>
    );
}

/** Footer action bar that breaks out to the card edges and separates actions. */
export function FormFooter({ children }: { children: ReactNode }): JSX.Element {
    return (
        <div className="bg-muted/40 -mx-6 mt-2 -mb-6 flex items-center justify-end gap-2 border-t px-6 py-4">
            {children}
        </div>
    );
}
