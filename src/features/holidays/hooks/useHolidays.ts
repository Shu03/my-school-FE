import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from "@tanstack/react-query";

import { createHoliday, deleteHoliday, listHolidays } from "../api/holidays.api";
import type { CreateHolidayRequest, Holiday, HolidaysListParams } from "../types/holiday.types";

export const holidaysKeys = {
    all: ["holidays"] as const,
    lists: () => [...holidaysKeys.all, "list"] as const,
    list: (params: HolidaysListParams) => [...holidaysKeys.lists(), params] as const,
};

export function useHolidaysList(
    params: HolidaysListParams,
    enabled = true,
): UseQueryResult<Holiday[]> {
    return useQuery({
        queryKey: holidaysKeys.list(params),
        queryFn: () => listHolidays(params),
        enabled,
    });
}

export function useCreateHoliday(): UseMutationResult<Holiday, Error, CreateHolidayRequest> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createHoliday,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: holidaysKeys.lists() });
        },
    });
}

export function useDeleteHoliday(): UseMutationResult<void, Error, { id: string }> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }) => deleteHoliday(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: holidaysKeys.lists() });
        },
    });
}
