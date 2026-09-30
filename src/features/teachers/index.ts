/**
 * Public API of the teachers feature.
 *
 * Pages are intentionally not exported here to preserve route-level code splitting.
 */

export {
    teachersKeys,
    useTeachersList,
    useTeacher,
    useTeacherAssignments,
    useUpdateTeacher,
    useCreateAssignment,
    useDeleteAssignment,
} from "./hooks/useTeachers";

export type {
    CreateAssignmentRequest,
    TeacherAssignment,
    TeacherClassRole,
    TeacherProfile,
    TeacherUser,
    UpdateTeacherRequest,
} from "./types/teacher.types";
