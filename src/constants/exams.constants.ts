export const EXAM_TYPE = {
    UNIT_TEST: "UNIT_TEST",
    MID_TERM: "MID_TERM",
    FINAL_EXAM: "FINAL_EXAM",
    ASSIGNMENT: "ASSIGNMENT",
    PROJECT: "PROJECT",
    PRACTICAL: "PRACTICAL",
} as const;

export type ExamType = (typeof EXAM_TYPE)[keyof typeof EXAM_TYPE];

export const EXAM_TYPE_LIST: ExamType[] = Object.values(EXAM_TYPE);

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
    UNIT_TEST: "Unit Test",
    MID_TERM: "Mid Term",
    FINAL_EXAM: "Final Exam",
    ASSIGNMENT: "Assignment",
    PROJECT: "Project",
    PRACTICAL: "Practical",
};

export const EXAM_STATUS = {
    ACTIVE: "ACTIVE",
    DISCARDED: "DISCARDED",
} as const;

export type ExamStatus = (typeof EXAM_STATUS)[keyof typeof EXAM_STATUS];

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
    ACTIVE: "Active",
    DISCARDED: "Discarded",
};

export const EXAM_VALIDATION = {
    NAME_MAX: 100,
    TOTAL_MARKS_MIN: 1,
    TOTAL_MARKS_MAX: 1000,
} as const;

export const EXAM_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/** Max students loaded when entering grades for an exam. */
export const GRADE_STUDENT_LIMIT = 100;
