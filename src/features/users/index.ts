/**
 * Public API of the users feature.
 *
 * The UsersPage is loaded directly by the router (see app/router/lazy.tsx).
 */

// Data-layer hooks
export {
    usersKeys,
    useUsersList,
    useUser,
    useCreateAdmin,
    useCreateTeacher,
    useCreateStudent,
    useUpdateUser,
    useActivateUser,
    useDeactivateUser,
} from "./hooks/useUsers";

// Domain types
export type {
    CreateAdminRequest,
    CreateStudentRequest,
    CreateTeacherRequest,
    CreateUserResult,
    StudentProfile,
    TeacherProfile,
    UpdateUserRequest,
    User,
    UserListParams,
    UserListResponse,
    UserWithProfiles,
    UserWithStudentProfile,
    UserWithTeacherProfile,
} from "./types/user.types";
