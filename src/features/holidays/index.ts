/**
 * Public API of the holidays feature.
 */

export { holidaysKeys, useHolidaysList, useCreateHoliday, useDeleteHoliday } from "./hooks/useHolidays";
export { HolidaysTable } from "./components/HolidaysTable";
export { HolidayFormDialog } from "./components/HolidayFormDialog";
export { HolidaysWidget } from "./components/HolidaysWidget";
export { getHolidayErrorMessage } from "./lib/errors";
export type { CreateHolidayFormValues } from "./schemas/holiday.schema";
export type { CreateHolidayRequest, Holiday, HolidaysListParams } from "./types/holiday.types";
