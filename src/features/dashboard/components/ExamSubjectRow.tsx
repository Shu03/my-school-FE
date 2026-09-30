import type { JSX, ReactNode } from "react";

import { Link } from "react-router-dom";

import { formatSectionLabel } from "@lib/section";

import type { ExamSubjectItem } from "../types/dashboard.types";

import { DateLeaf } from "./DateLeaf";
import { ExamTypeChip, RelativeDayBadge } from "./StatusChip";

interface ExamSubjectRowProps {
    item: ExamSubjectItem;
    today: string;
    showSection?: boolean;
    to?: string;
    /** Trailing slot (e.g. grading progress / action). */
    aside?: ReactNode;
    children?: ReactNode;
}

export function ExamSubjectRow({
    item,
    today,
    showSection = true,
    to,
    aside,
    children,
}: ExamSubjectRowProps): JSX.Element {
    const title = to ? (
        <Link
            to={to}
            className="hover:text-primary focus-visible:ring-ring/50 rounded-sm font-semibold transition-colors outline-none focus-visible:ring-2"
        >
            {item.examName}
        </Link>
    ) : (
        <span className="font-semibold">{item.examName}</span>
    );

    return (
        <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <DateLeaf iso={item.date} today={today} />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <h3 className="contents">{title}</h3>
                    <ExamTypeChip type={item.examType} />
                    <RelativeDayBadge iso={item.date} today={today} />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                    {showSection ? (
                        <>
                            <span className="text-foreground/80 font-medium">
                                {formatSectionLabel(item.classLevel, item.sectionName)}
                            </span>
                            <span aria-hidden="true"> · </span>
                        </>
                    ) : null}
                    {item.subjectName}
                    <span aria-hidden="true"> · </span>
                    Max {item.totalMarks}
                </p>
                {children}
            </div>
            {aside ? <div className="shrink-0 self-center">{aside}</div> : null}
        </li>
    );
}
