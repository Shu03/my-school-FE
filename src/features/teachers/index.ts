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
    usePresetsList,
    useCreatePreset,
    useUpdatePreset,
    useDeletePreset,
    useUpdateTeacher,
    useAssignPreset,
    useRemovePreset,
    useReplaceOverrides,
    useCreateAssignment,
    useDeleteAssignment,
} from "./hooks/useTeachers";

export type {
    AssignPresetRequest,
    CreateAssignmentRequest,
    CreatePresetRequest,
    PermissionPreset,
    ReplaceOverridesRequest,
    TeacherAssignment,
    TeacherClassRole,
    TeacherProfile,
    TeacherUser,
    UpdatePresetRequest,
    UpdateTeacherRequest,
} from "./types/teacher.types";
