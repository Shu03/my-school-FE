/**
 * Public API of the students feature.
 *
 * Pages are intentionally not exported here to preserve route-level code splitting.
 */

export {
    studentsKeys,
    useStudentsList,
    useStudent,
    useStudentEnrollments,
    useUpdateStudent,
    useEnrollStudent,
    useUpdateEnrollment,
    usePromoteStudents,
} from "./hooks/useStudents";

export type {
    EnrollStudentRequest,
    EnrollmentAcademicYear,
    EnrollmentClass,
    PromoteStudentsRequest,
    PromoteStudentsResponse,
    StudentEnrollment,
    StudentProfile,
    StudentProfileWithEnrollments,
    StudentUserSummary,
    StudentsListParams,
    StudentsListResponse,
    UpdateEnrollmentRequest,
    UpdateStudentRequest,
} from "./types/student.types";
