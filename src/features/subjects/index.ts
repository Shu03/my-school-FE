/**
 * Public API of the subjects feature.
 *
 * Pages are intentionally not exported here to preserve route-level code splitting.
 */

export {
    subjectsKeys,
    useSubjectsList,
    useSubject,
    useCreateSubject,
    useUpdateSubject,
    useDeleteSubject,
} from "./hooks/useSubjects";

export type {
    CreateSubjectRequest,
    Subject,
    SubjectAssignment,
    SubjectWithAssignments,
    SubjectsListParams,
    TeacherAssignmentRole,
    UpdateSubjectRequest,
} from "./types/subject.types";
