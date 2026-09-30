import type { JSX, ReactNode } from "react";

import { CalendarClock } from "lucide-react";

import { DASHBOARD_CONFIG } from "@constants/dashboard.constants";
import { examDetail, ROUTES } from "@constants/routes.constants";

import type { ExamSubjectItem } from "../types/dashboard.types";

import { ExamSubjectRow } from "./ExamSubjectRow";
import { EmptyState, SectionCard } from "./SectionCard";

interface UpcomingExamsCardProps {
    items: ExamSubjectItem[];
    today: string;
    /** Admin / teacher can open exams; students cannot. */
    linkable: boolean;
    showSection?: boolean;
    headerExtra?: ReactNode;
    className?: string;
}

export function UpcomingExamsCard({
    items,
    today,
    linkable,
    showSection = true,
    headerExtra,
    className,
}: UpcomingExamsCardProps): JSX.Element {
    return (
        <SectionCard
            icon={CalendarClock}
            title="Upcoming exams"
            description={`Next ${DASHBOARD_CONFIG.UPCOMING_WINDOW_DAYS} days`}
            action={linkable ? { label: "View all", to: ROUTES.EXAMS } : undefined}
            headerExtra={headerExtra}
            className={className}
        >
            {items.length === 0 ? (
                <EmptyState
                    icon={CalendarClock}
                    message={`No exams in the next ${DASHBOARD_CONFIG.UPCOMING_WINDOW_DAYS} days`}
                />
            ) : (
                <ul className="divide-border/60 divide-y">
                    {items.map((item) => (
                        <ExamSubjectRow
                            key={item.examSubjectId}
                            item={item}
                            today={today}
                            showSection={showSection}
                            to={linkable ? examDetail(item.examId) : undefined}
                        />
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}
