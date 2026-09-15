import type { JSX } from "react";

import type { AnnouncementPreview } from "../lib/mockStats";

export function AnnouncementsPreviewList({ items }: { items: AnnouncementPreview[] }): JSX.Element {
    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li
                    key={item.id}
                    className="border-border/60 bg-muted/25 rounded-lg border px-3 py-2.5"
                >
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <span className="text-muted-foreground shrink-0 text-xs">{item.date}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {item.content}
                    </p>
                    <p className="text-muted-foreground/80 mt-1.5 text-[0.7rem] font-medium">
                        {item.author}
                    </p>
                </li>
            ))}
        </ul>
    );
}
