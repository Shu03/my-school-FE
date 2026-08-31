import { createBrowserRouter } from "react-router-dom";

import { PERMISSIONS } from "@constants/permissions.constants";
import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import {
    ProtectedRoute,
    PublicOnlyRoute,
    RoleGuard,
    ChangePasswordRoute,
    RoleOrPermissionGuard,
} from "./guards";
import {
    ChangePasswordPage,
    DashboardPage,
    Lazy,
    LoginPage,
    AcademicYearsPage,
    ManageAcademicYearsPage,
    AcademicYearTermsPage,
    ClassesPage,
    SubjectsPage,
    TeachersPage,
    TeacherDetailPage,
    StudentsPage,
    StudentDetailPage,
    UserCreatePage,
    UserEditPage,
    UsersPage,
    AttendancePage,
    HomeworkPage,
    AnnouncementsPage,
    ExamsPage,
    ExamDetailPage,
} from "./lazy";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
    // Public routes (redirect to dashboard if already logged in)
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                path: ROUTES.LOGIN,
                element: (
                    <Lazy>
                        <LoginPage />
                    </Lazy>
                ),
            },
        ],
    },

    // Change password route (semi-public: needs firstLoginToken or auth)
    {
        element: <ChangePasswordRoute />,
        children: [
            {
                path: ROUTES.CHANGE_PASSWORD,
                element: (
                    <Lazy>
                        <ChangePasswordPage />
                    </Lazy>
                ),
            },
        ],
    },

    // Protected routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: ROUTES.DASHBOARD,
                element: (
                    <Lazy>
                        <DashboardPage />
                    </Lazy>
                ),
            },

            {
                path: ROUTES.TEACHER_DETAIL,
                element: (
                    <Lazy>
                        <TeacherDetailPage />
                    </Lazy>
                ),
            },

            {
                path: ROUTES.STUDENT_DETAIL,
                element: (
                    <Lazy>
                        <StudentDetailPage />
                    </Lazy>
                ),
            },

            {
                path: ROUTES.HOMEWORK,
                element: (
                    <Lazy>
                        <HomeworkPage />
                    </Lazy>
                ),
            },

            {
                path: ROUTES.ANNOUNCEMENTS,
                element: (
                    <Lazy>
                        <AnnouncementsPage />
                    </Lazy>
                ),
            },

            {
                path: ROUTES.EXAMS,
                element: (
                    <Lazy>
                        <ExamsPage />
                    </Lazy>
                ),
            },

            {
                path: ROUTES.EXAM_DETAIL,
                element: (
                    <Lazy>
                        <ExamDetailPage />
                    </Lazy>
                ),
            },

            // Admin-only routes
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN]} />,
                children: [
                    {
                        path: ROUTES.USERS,
                        element: (
                            <Lazy>
                                <UsersPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.USER_NEW,
                        element: (
                            <Lazy>
                                <UserCreatePage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.USER_EDIT,
                        element: (
                            <Lazy>
                                <UserEditPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.TEACHERS,
                        element: (
                            <Lazy>
                                <TeachersPage />
                            </Lazy>
                        ),
                    },
                ],
            },

            // Admin and teacher (teacher list is scoped by the backend)
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.TEACHER]} />,
                children: [
                    {
                        path: ROUTES.STUDENTS,
                        element: (
                            <Lazy>
                                <StudentsPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.ATTENDANCE,
                        element: (
                            <Lazy>
                                <AttendancePage />
                            </Lazy>
                        ),
                    },
                ],
            },
            {
                element: (
                    <RoleOrPermissionGuard
                        allowedRoles={[Role.ADMIN]}
                        permissionRole={Role.TEACHER}
                        requiredPermission={PERMISSIONS.ACADEMIC_YEAR_MANAGE}
                    />
                ),
                children: [
                    {
                        path: ROUTES.ACADEMIC_YEARS,
                        element: (
                            <Lazy>
                                <AcademicYearsPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.ACADEMIC_YEARS_MANAGE,
                        element: (
                            <Lazy>
                                <ManageAcademicYearsPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.ACADEMIC_YEAR_TERMS,
                        element: (
                            <Lazy>
                                <AcademicYearTermsPage />
                            </Lazy>
                        ),
                    },
                ],
            },
            {
                element: (
                    <RoleOrPermissionGuard
                        allowedRoles={[Role.ADMIN]}
                        permissionRole={Role.TEACHER}
                        requiredPermission={PERMISSIONS.CLASS_MANAGE}
                    />
                ),
                children: [
                    {
                        path: ROUTES.CLASSES,
                        element: (
                            <Lazy>
                                <ClassesPage />
                            </Lazy>
                        ),
                    },
                ],
            },
            {
                element: (
                    <RoleOrPermissionGuard
                        allowedRoles={[Role.ADMIN]}
                        permissionRole={Role.TEACHER}
                        requiredPermission={PERMISSIONS.SUBJECT_MANAGE}
                    />
                ),
                children: [
                    {
                        path: ROUTES.SUBJECTS,
                        element: (
                            <Lazy>
                                <SubjectsPage />
                            </Lazy>
                        ),
                    },
                ],
            },
        ],
    },

    // Catch-all
    {
        path: ROUTES.NOT_FOUND,
        element: <NotFoundPage />,
    },
]);
