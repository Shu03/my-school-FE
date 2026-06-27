import type { JSX } from "react";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AcademicYearOption {
    id: string;
    name: string;
}

interface ClassesToolbarProps {
    years: AcademicYearOption[];
    selectedAcademicYearId: string;
    gradeLevelFilter: string;
    onAcademicYearChange: (academicYearId: string) => void;
    onGradeLevelFilterChange: (value: string) => void;
}

export function ClassesToolbar({
    years,
    selectedAcademicYearId,
    gradeLevelFilter,
    onAcademicYearChange,
    onGradeLevelFilterChange,
}: ClassesToolbarProps): JSX.Element {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedAcademicYearId} onValueChange={onAcademicYearChange}>
                <SelectTrigger className="w-44" aria-label="Select academic year">
                    <SelectValue placeholder="Academic year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                            {year.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                placeholder="Filter grade"
                className="w-34"
                value={gradeLevelFilter}
                onChange={(event) => onGradeLevelFilterChange(event.target.value)}
            />
        </div>
    );
}
