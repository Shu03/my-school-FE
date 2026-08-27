/**
 * Public API of the homework feature.
 *
 * Pages are intentionally not exported here to preserve route-level code splitting.
 */

export {
    homeworkKeys,
    useHomeworkList,
    useHomework,
    useCreateHomework,
    useUpdateHomework,
    useDeleteHomework,
} from "./hooks/useHomework";

export type {
    CreateHomeworkRequest,
    Homework,
    HomeworkClass,
    HomeworkCreator,
    HomeworkListParams,
    HomeworkSubject,
    UpdateHomeworkRequest,
} from "./types/homework.types";
