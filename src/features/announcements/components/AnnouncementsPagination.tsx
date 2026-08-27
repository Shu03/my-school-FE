import type { JSX } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { ANNOUNCEMENT_PAGINATION } from "@constants/announcements.constants";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AnnouncementsPaginationProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export function AnnouncementsPagination({
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
}: AnnouncementsPaginationProps): JSX.Element {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-muted-foreground text-sm">
                {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
            </p>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Rows</span>
                    <Select
                        value={String(limit)}
                        onValueChange={(value) => onLimitChange(Number(value))}
                    >
                        <SelectTrigger size="sm" className="w-18" aria-label="Rows per page">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ANNOUNCEMENT_PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm tabular-nums">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Previous page"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        <ChevronLeft />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Next page"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
