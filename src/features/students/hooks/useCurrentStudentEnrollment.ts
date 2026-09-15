import { useMemo } from "react";

import { useCurrentAcademicYear } from "@features/academic-years";
import { useAuthStore } from "@features/auth";

import { useStudent } from "./useStudents";

export function useCurrentStudentEnrollment() {
    const user = useAuthStore((state) => state.user);
    const { data: currentYear, isLoading: isYearLoading } = useCurrentAcademicYear();
    const { data: student, isLoading: isStudentLoading } = useStudent(
        user?.studentProfileId ?? null,
    );

    const enrollment = useMemo(
        () => student?.enrollments.find((item) => item.academicYearId === currentYear?.id) ?? null,
        [currentYear?.id, student?.enrollments],
    );

    return {
        currentYear,
        enrollment,
        student,
        isLoading: isYearLoading || isStudentLoading,
        hasStudentProfile: Boolean(user?.studentProfileId),
    };
}
