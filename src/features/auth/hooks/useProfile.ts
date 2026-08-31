import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { getProfile } from "../api/auth.api";
import type { Profile } from "../types/auth.types";

export const profileKeys = {
    all: ["profile"] as const,
};

export function useProfile(): UseQueryResult<Profile> {
    return useQuery({
        queryKey: profileKeys.all,
        queryFn: getProfile,
    });
}
