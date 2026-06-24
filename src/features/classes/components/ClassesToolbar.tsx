import type { JSX } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    onCreateClick: () => void;
}

export function ClassesToolbar({
    years,
    selectedAcademicYearId,
    gradeLevelFilter,
    onAcademicYearChange,
    onGradeLevelFilterChange,
    onCreateClick,
}: ClassesToolbarProps): JSX.Element {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

            <Button type="button" onClick={onCreateClick}>
                <Plus />
                Create class
            </Button>
        </div>
    );
}
