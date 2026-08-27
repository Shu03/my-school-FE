/**
 * Backend API endpoint paths, relative to the configured API base URL.
 */
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/auth/login",
        REFRESH: "/auth/refresh",
        LOGOUT: "/auth/logout",
        CHANGE_PASSWORD: "/auth/change-password",
        RESET_PASSWORD: "/auth/admin/reset-password",
        ME: "/auth/me",
    },
    USERS: {
        BASE: "/users",
        ADMIN: "/users/admin",
        TEACHER: "/users/teacher",
        STUDENT: "/users/student",
        byId: (id: string) => `/users/${id}`,
        activate: (id: string) => `/users/${id}/activate`,
        deactivate: (id: string) => `/users/${id}/deactivate`,
    },
    ACADEMIC_YEARS: {
        BASE: "/academic-years",
        CURRENT: "/academic-years/current",
        byId: (id: string) => `/academic-years/${id}`,
        setCurrent: (id: string) => `/academic-years/${id}/set-current`,
        terms: (id: string) => `/academic-years/${id}/terms`,
        termById: (id: string, termId: string) => `/academic-years/${id}/terms/${termId}`,
    },
    CLASSES: {
        BASE: "/classes",
        byId: (id: string) => `/classes/${id}`,
        assignTeacher: (id: string) => `/classes/${id}/assign-teacher`,
        removeTeacher: (id: string) => `/classes/${id}/remove-teacher`,
    },
    SUBJECTS: {
        BASE: "/subjects",
        byId: (id: string) => `/subjects/${id}`,
    },
    TEACHERS: {
        BASE: "/teachers",
        PRESETS: "/teachers/presets",
        presetById: (presetId: string) => `/teachers/presets/${presetId}`,
        byId: (id: string) => `/teachers/${id}`,
        assignPreset: (id: string) => `/teachers/${id}/assign-preset`,
        removePreset: (id: string) => `/teachers/${id}/remove-preset`,
        permissions: (id: string) => `/teachers/${id}/permissions`,
        assignments: (id: string) => `/teachers/${id}/assignments`,
        assignmentById: (id: string, assignmentId: string) =>
            `/teachers/${id}/assignments/${assignmentId}`,
    },
    STUDENTS: {
        BASE: "/students",
        PROMOTE: "/students/promote",
        byId: (id: string) => `/students/${id}`,
        enroll: (id: string) => `/students/${id}/enroll`,
        enrollments: (id: string) => `/students/${id}/enrollments`,
        enrollmentById: (id: string, enrollmentId: string) =>
            `/students/${id}/enrollments/${enrollmentId}`,
    },
    SCHOOL: {
        SETTINGS: "/school/settings",
        HOLIDAYS: "/school/holidays",
        holidayById: (id: string) => `/school/holidays/${id}`,
    },
    ATTENDANCE: {
        BASE: "/attendance",
        MARK: "/attendance/mark",
        SUMMARY: "/attendance/summary",
        byStudent: (studentId: string) => `/attendance/student/${studentId}`,
    },
    EXAMS: {
        BASE: "/exams",
        byId: (id: string) => `/exams/${id}`,
        finalize: (id: string) => `/exams/${id}/finalize`,
        unlock: (id: string) => `/exams/${id}/unlock`,
        discard: (id: string) => `/exams/${id}/discard`,
    },
    GRADES: {
        examGrades: (examId: string) => `/exams/${examId}/grades`,
        examSummary: (examId: string) => `/exams/${examId}/grades/summary`,
        studentHistory: (studentId: string) => `/grades/student/${studentId}`,
    },
    HOMEWORK: {
        BASE: "/homework",
        byId: (id: string) => `/homework/${id}`,
    },
    ANNOUNCEMENTS: {
        BASE: "/announcements",
        byId: (id: string) => `/announcements/${id}`,
    },
} as const;
