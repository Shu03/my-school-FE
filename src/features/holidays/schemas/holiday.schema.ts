import { z } from "zod";

import { HOLIDAY_VALIDATION } from "@constants/holidays.constants";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

export const createHolidaySchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Holiday name is required")
        .max(
            HOLIDAY_VALIDATION.NAME_MAX,
            `Name must be at most ${HOLIDAY_VALIDATION.NAME_MAX} characters`,
        ),
    date: isoDateSchema,
});

export type CreateHolidayFormValues = z.infer<typeof createHolidaySchema>;
