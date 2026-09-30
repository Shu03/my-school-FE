import { createBrowserRouter } from "react-router-dom";

import { ROUTES } from "@constants/routes.constants";

import { Role } from "@/types/api";

import {
    ProtectedRoute,
    PublicOnlyRoute,
    RoleGuard,
    ChangePasswordRoute,
} from "./guards";
import {
    ChangePasswordPage,
    DashboardPage,
    Lazy,
    LoginPage,
    ProfilePage,
    AcademicYearsPage,
    ManageAcademicYearsPage,
    AcademicYearTermsPage,
    ClassesPage,
    ClassDetailPage,
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
    FeesPage,
    FeeRecordDetailPage,
    MyFeesPage,
    MyReportCardPage,
    AccountsPage,
    RequestAccessPage,
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
                path: ROUTES.PROFILE,
                element: (
                    <Lazy>
                        <ProfilePage />
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
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.TEACHER]} />,
                children: [
                    {
                        path: ROUTES.REQUEST_ACCESS,
                        element: (
                            <Lazy>
                                <RequestAccessPage />
                            </Lazy>
                        ),
                    },
                ],
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
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.TEACHER]} />,
                children: [
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
                ],
            },

            {
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.STUDENT]} />,
                children: [
                    {
                        path: ROUTES.FEE_DETAIL,
                        element: (
                            <Lazy>
                                <FeeRecordDetailPage />
                            </Lazy>
                        ),
                    },
                ],
            },

            // Student self-scoped routes
            {
                element: <RoleGuard allowedRoles={[Role.STUDENT]} />,
                children: [
                    {
                        path: ROUTES.MY_FEES,
                        element: (
                            <Lazy>
                                <MyFeesPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.MY_REPORT_CARD,
                        element: (
                            <Lazy>
                                <MyReportCardPage />
                            </Lazy>
                        ),
                    },
                ],
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
                    {
                        path: ROUTES.ACCOUNTS,
                        element: (
                            <Lazy>
                                <AccountsPage />
                            </Lazy>
                        ),
                    },
                ],
            },

            // Admin and teacher (student list is scoped by the backend)
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
                ],
            },
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]} />,
                children: [
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
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.TEACHER]} />,
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
                element: <RoleGuard allowedRoles={[Role.ADMIN]} />,
                children: [
                    {
                        path: ROUTES.ACADEMIC_YEARS_MANAGE,
                        element: (
                            <Lazy>
                                <ManageAcademicYearsPage />
                            </Lazy>
                        ),
                    },
                ],
            },
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.TEACHER]} />,
                children: [
                    {
                        path: ROUTES.CLASSES,
                        element: (
                            <Lazy>
                                <ClassesPage />
                            </Lazy>
                        ),
                    },
                    {
                        path: ROUTES.CLASS_DETAIL,
                        element: (
                            <Lazy>
                                <ClassDetailPage />
                            </Lazy>
                        ),
                    },
                ],
            },
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN, Role.TEACHER]} />,
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
            {
                element: <RoleGuard allowedRoles={[Role.ADMIN]} />,
                children: [
                    {
                        path: ROUTES.FEES,
                        element: (
                            <Lazy>
                                <FeesPage />
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
