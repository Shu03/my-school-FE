/** Permission identifiers exposed by backend auth claims. */
export const PERMISSIONS = {
    ACADEMIC_YEAR_MANAGE: "ACADEMIC_YEAR_MANAGE",
    CLASS_MANAGE: "CLASS_MANAGE",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
