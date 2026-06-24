import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import {
    createAcademicYear,
    createTerm,
    deleteTerm,
    getAcademicYearById,
    getCurrentAcademicYear,
    listAcademicYears,
    listTermsByAcademicYear,
    setCurrentAcademicYear,
    updateAcademicYear,
    updateTerm,
} from "../api/academic-years.api";
import type {
    AcademicYear,
    AcademicYearWithTerms,
    CreateAcademicYearRequest,
    CreateTermRequest,
    Term,
    UpdateAcademicYearRequest,
    UpdateTermRequest,
} from "../types/academic-year.types";

export const academicYearsKeys = {
    all: ["academic-years"] as const,
    lists: () => [...academicYearsKeys.all, "list"] as const,
    details: () => [...academicYearsKeys.all, "detail"] as const,
    detail: (id: string) => [...academicYearsKeys.details(), id] as const,
    current: () => [...academicYearsKeys.all, "current"] as const,
    terms: (id: string) => [...academicYearsKeys.all, "terms", id] as const,
};

export function useAcademicYearsList(): UseQueryResult<AcademicYear[]> {
    return useQuery({
        queryKey: academicYearsKeys.lists(),
        queryFn: listAcademicYears,
    });
}

export function useCurrentAcademicYear(): UseQueryResult<AcademicYearWithTerms> {
    return useQuery({
        queryKey: academicYearsKeys.current(),
        queryFn: getCurrentAcademicYear,
    });
}

export function useAcademicYear(id: string | null): UseQueryResult<AcademicYearWithTerms> {
    return useQuery({
        queryKey: academicYearsKeys.detail(id ?? ""),
        queryFn: () => getAcademicYearById(id as string),
        enabled: Boolean(id),
    });
}

export function useAcademicYearTerms(id: string | null): UseQueryResult<Term[]> {
    return useQuery({
        queryKey: academicYearsKeys.terms(id ?? ""),
        queryFn: () => listTermsByAcademicYear(id as string),
        enabled: Boolean(id),
    });
}

export function useCreateAcademicYear(): UseMutationResult<
    AcademicYear,
    Error,
    CreateAcademicYearRequest
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAcademicYear,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.current() });
        },
    });
}

export function useUpdateAcademicYear(): UseMutationResult<
    AcademicYear,
    Error,
    { id: string; data: UpdateAcademicYearRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateAcademicYear(id, data),
        onSuccess: (year) => {
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.detail(year.id) });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.current() });
        },
    });
}

export function useSetCurrentAcademicYear(): UseMutationResult<AcademicYear, Error, string> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: setCurrentAcademicYear,
        onSuccess: (year) => {
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.lists() });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.detail(year.id) });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.current() });
        },
    });
}

export function useCreateTerm(): UseMutationResult<
    Term,
    Error,
    { id: string; data: CreateTermRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => createTerm(id, data),
        onSuccess: (term) => {
            void queryClient.invalidateQueries({
                queryKey: academicYearsKeys.terms(term.academicYearId),
            });
            void queryClient.invalidateQueries({
                queryKey: academicYearsKeys.detail(term.academicYearId),
            });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.current() });
        },
    });
}

export function useUpdateTerm(): UseMutationResult<
    Term,
    Error,
    { id: string; termId: string; data: UpdateTermRequest }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, termId, data }) => updateTerm(id, termId, data),
        onSuccess: (term) => {
            void queryClient.invalidateQueries({
                queryKey: academicYearsKeys.terms(term.academicYearId),
            });
            void queryClient.invalidateQueries({
                queryKey: academicYearsKeys.detail(term.academicYearId),
            });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.current() });
        },
    });
}

export function useDeleteTerm(): UseMutationResult<void, Error, { id: string; termId: string }> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, termId }) => deleteTerm(id, termId),
        onSuccess: (_response, variables) => {
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.terms(variables.id) });
            void queryClient.invalidateQueries({
                queryKey: academicYearsKeys.detail(variables.id),
            });
            void queryClient.invalidateQueries({ queryKey: academicYearsKeys.current() });
        },
    });
}
