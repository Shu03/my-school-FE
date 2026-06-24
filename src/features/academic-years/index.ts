/**
 * Public API of the academic-years feature.
 *
 * Pages are intentionally NOT exported here — router lazy imports pages directly.
 */

export {
    academicYearsKeys,
    useAcademicYearsList,
    useAcademicYear,
    useAcademicYearTerms,
    useCurrentAcademicYear,
    useCreateAcademicYear,
    useUpdateAcademicYear,
    useSetCurrentAcademicYear,
    useCreateTerm,
    useUpdateTerm,
    useDeleteTerm,
} from "./hooks/useAcademicYears";

export type {
    AcademicYear,
    AcademicYearWithTerms,
    CreateAcademicYearRequest,
    CreateTermRequest,
    Term,
    UpdateAcademicYearRequest,
    UpdateTermRequest,
} from "./types/academic-year.types";
