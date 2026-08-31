/** Permission identifiers exposed by backend auth claims (teacher preset ∪ overrides). */
export const PERMISSIONS = {
    LEAVE_APPLY: "LEAVE_APPLY",
    ACADEMIC_YEAR_MANAGE: "ACADEMIC_YEAR_MANAGE",
    CLASS_MANAGE: "CLASS_MANAGE",
    SUBJECT_MANAGE: "SUBJECT_MANAGE",
    ATTENDANCE_READ: "ATTENDANCE_READ",
    ATTENDANCE_WRITE: "ATTENDANCE_WRITE",
    GRADES_READ: "GRADES_READ",
    GRADES_WRITE: "GRADES_WRITE",
    NOTES_UPLOAD: "NOTES_UPLOAD",
    HOMEWORK_MANAGE: "HOMEWORK_MANAGE",
    ANNOUNCEMENTS_MANAGE: "ANNOUNCEMENTS_MANAGE",
    REPORTS_VIEW: "REPORTS_VIEW",
    FEES_MANAGE: "FEES_MANAGE",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Ordered permission list for selection UIs. */
export const PERMISSION_LIST: Permission[] = Object.values(PERMISSIONS);

/** Human-readable labels for permission identifiers. */
export const PERMISSION_LABELS: Record<Permission, string> = {
    LEAVE_APPLY: "Apply for leave",
    ACADEMIC_YEAR_MANAGE: "Manage academic years",
    CLASS_MANAGE: "Manage classes",
    SUBJECT_MANAGE: "Manage subjects",
    ATTENDANCE_READ: "View attendance",
    ATTENDANCE_WRITE: "Mark attendance",
    GRADES_READ: "View grades",
    GRADES_WRITE: "Enter grades",
    NOTES_UPLOAD: "Upload notes",
    HOMEWORK_MANAGE: "Manage homework",
    ANNOUNCEMENTS_MANAGE: "Manage announcements",
    REPORTS_VIEW: "View reports",
    FEES_MANAGE: "Manage fees",
};
