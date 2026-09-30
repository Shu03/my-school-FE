import { useId, useState } from "react";
import type { JSX } from "react";

import { Clock, Megaphone } from "lucide-react";

import { DASHBOARD_CONFIG } from "@constants/dashboard.constants";
import { ROUTES } from "@constants/routes.constants";

import { formatDateTime } from "../lib/format";
import type { AnnouncementItem } from "../types/dashboard.types";

import { EmptyState, SectionCard } from "./SectionCard";

const CLAMP_STYLE = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: DASHBOARD_CONFIG.ANNOUNCEMENT_CLAMP_LINES,
    overflow: "hidden",
} as const;

function AnnouncementEntry({ item }: { item: AnnouncementItem }): JSX.Element {
    const contentId = useId();
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);

    function measure(node: HTMLParagraphElement | null): (() => void) | undefined {
        if (!node) {
            return undefined;
        }
        const observer = new ResizeObserver(() => {
            setOverflowing(node.scrollHeight > node.clientHeight + 1);
        });
        observer.observe(node);
        return () => observer.disconnect();
    }

    return (
        <li className="group before:bg-primary/30 hover:before:bg-primary relative py-3 pl-4 before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:transition-colors first:pt-0 first:before:top-0 last:pb-0 last:before:bottom-0">
            <h3 className="text-sm font-semibold">{item.title}</h3>
            <p
                id={contentId}
                ref={measure}
                className="text-muted-foreground mt-1 text-sm whitespace-pre-line"
                style={expanded ? undefined : CLAMP_STYLE}
            >
                {item.content}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <Clock className="size-3.5" aria-hidden="true" />
                    Until {formatDateTime(item.endDate)}
                </span>
                {overflowing || expanded ? (
                    <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={contentId}
                        onClick={() => setExpanded((value) => !value)}
                        className="text-primary focus-visible:ring-ring/50 rounded-sm text-xs font-semibold outline-none hover:underline focus-visible:ring-2"
                    >
                        {expanded ? "Show less" : "Read more"}
                    </button>
                ) : null}
            </div>
        </li>
    );
}

export function AnnouncementList({
    items,
    className,
}: {
    items: AnnouncementItem[];
    className?: string;
}): JSX.Element {
    return (
        <SectionCard
            icon={Megaphone}
            title="Announcements"
            description="Active right now"
            action={{ label: "View all", to: ROUTES.ANNOUNCEMENTS }}
            className={className}
        >
            {items.length === 0 ? (
                <EmptyState icon={Megaphone} message="No announcements" />
            ) : (
                <ul className="divide-border/60 divide-y">
                    {items.map((item) => (
                        <AnnouncementEntry key={item.id} item={item} />
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}
