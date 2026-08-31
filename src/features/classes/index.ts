/**
 * Public API of the classes feature.
 *
 * Pages are intentionally not exported here to preserve route-level code splitting.
 */

export {
    classesKeys,
    useClassesList,
    useClass,
    useCreateClass,
    useUpdateClass,
} from "./hooks/useClasses";

export type {
    ClassesListParams,
    CreateClassRequest,
    SchoolClass,
    SchoolClassWithRelations,
    TeacherOption,
    UpdateClassRequest,
} from "./types/class.types";
