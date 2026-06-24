/**
 * Public API of the classes feature.
 *
 * Pages are intentionally not exported here to preserve route-level code splitting.
 */

export {
    classesKeys,
    useClassesList,
    useClass,
    useAssignableTeachers,
    useCreateClass,
    useUpdateClass,
    useAssignClassTeacher,
    useRemoveClassTeacher,
} from "./hooks/useClasses";

export type {
    AssignClassTeacherRequest,
    ClassesListParams,
    CreateClassRequest,
    SchoolClass,
    SchoolClassWithRelations,
    TeacherOption,
    TeacherProfileSummary,
    UpdateClassRequest,
} from "./types/class.types";
