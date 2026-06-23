import { useState } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { Backpack, GraduationCap, Shield, UserRoundPlus } from "lucide-react";

import { ROUTES } from "@constants/routes.constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Field } from "../components/Field";
import { BaseUserFields, ServerError } from "../components/UserFormFields";
import { FormFooter, FormSection, UserFormShell } from "../components/UserFormShell";
import { useCreateAdmin, useCreateStudent, useCreateTeacher } from "../hooks/useUsers";
import { getUserErrorMessage } from "../lib/errors";
import { emptyToUndefined } from "../lib/form";
import {
    createAdminSchema,
    createStudentSchema,
    createTeacherSchema,
    type CreateAdminFormValues,
    type CreateStudentFormValues,
    type CreateTeacherFormValues,
} from "../schemas/user.schema";
import type { User } from "../types/user.types";

// TODO: add unsaved-changes guard to warn before navigating away with a dirty form.

export function UserCreatePage(): JSX.Element {
    const navigate = useNavigate();

    function handleCreated(user: User, tempPassword: string): void {
        navigate(ROUTES.USERS, { state: { createdUser: user, tempPassword } });
    }

    return (
        <UserFormShell
            title="Create user"
            description="Choose a role and fill in the details. A temporary password is generated automatically."
            icon={<UserRoundPlus className="size-5" />}
        >
            <Tabs defaultValue="ADMIN">
                <TabsList className="h-10 w-full">
                    <TabsTrigger value="ADMIN">
                        <Shield />
                        Admin
                    </TabsTrigger>
                    <TabsTrigger value="TEACHER">
                        <GraduationCap />
                        Teacher
                    </TabsTrigger>
                    <TabsTrigger value="STUDENT">
                        <Backpack />
                        Student
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ADMIN">
                    <AdminForm onCreated={handleCreated} />
                </TabsContent>
                <TabsContent value="TEACHER">
                    <TeacherForm onCreated={handleCreated} />
                </TabsContent>
                <TabsContent value="STUDENT">
                    <StudentForm onCreated={handleCreated} />
                </TabsContent>
            </Tabs>
        </UserFormShell>
    );
}

interface RoleFormProps {
    onCreated: (user: User, tempPassword: string) => void;
}

function FormActions({
    isSubmitting,
    label,
}: {
    isSubmitting: boolean;
    label: string;
}): JSX.Element {
    const navigate = useNavigate();
    return (
        <FormFooter>
            <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => navigate(ROUTES.USERS)}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner />}
                {label}
            </Button>
        </FormFooter>
    );
}

function AdminForm({ onCreated }: RoleFormProps): JSX.Element {
    const [serverError, setServerError] = useState<string | null>(null);
    const createAdmin = useCreateAdmin();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateAdminFormValues>({
        resolver: zodResolver(createAdminSchema),
        defaultValues: { firstName: "", lastName: "", mobileNumber: "", email: "" },
    });

    async function onSubmit(values: CreateAdminFormValues): Promise<void> {
        setServerError(null);
        try {
            const result = await createAdmin.mutateAsync({
                firstName: values.firstName,
                lastName: values.lastName,
                mobileNumber: values.mobileNumber,
                email: emptyToUndefined(values.email),
            });
            onCreated(result.user, result.tempPassword);
        } catch (error) {
            setServerError(getUserErrorMessage(error));
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6" noValidate>
            <ServerError message={serverError} />
            <BaseUserFields register={register} errors={errors} />
            <FormActions isSubmitting={isSubmitting} label="Create admin" />
        </form>
    );
}

function TeacherForm({ onCreated }: RoleFormProps): JSX.Element {
    const [serverError, setServerError] = useState<string | null>(null);
    const createTeacher = useCreateTeacher();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateTeacherFormValues>({
        resolver: zodResolver(createTeacherSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            mobileNumber: "",
            email: "",
            employeeCode: "",
            joiningDate: "",
        },
    });

    async function onSubmit(values: CreateTeacherFormValues): Promise<void> {
        setServerError(null);
        try {
            const result = await createTeacher.mutateAsync({
                firstName: values.firstName,
                lastName: values.lastName,
                mobileNumber: values.mobileNumber,
                email: emptyToUndefined(values.email),
                employeeCode: values.employeeCode,
                joiningDate: emptyToUndefined(values.joiningDate),
            });
            onCreated(result.user, result.tempPassword);
        } catch (error) {
            setServerError(getUserErrorMessage(error));
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6" noValidate>
            <ServerError message={serverError} />
            <BaseUserFields register={register} errors={errors} />
            <FormSection title="Teacher details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        label="Employee code"
                        htmlFor="employeeCode"
                        required
                        error={errors.employeeCode?.message}
                    >
                        <Input
                            id="employeeCode"
                            placeholder="e.g. TCH001"
                            {...register("employeeCode")}
                        />
                    </Field>
                    <Field
                        label="Joining date"
                        htmlFor="joiningDate"
                        error={errors.joiningDate?.message}
                    >
                        <Input id="joiningDate" type="date" {...register("joiningDate")} />
                    </Field>
                </div>
            </FormSection>
            <FormActions isSubmitting={isSubmitting} label="Create teacher" />
        </form>
    );
}

function StudentForm({ onCreated }: RoleFormProps): JSX.Element {
    const [serverError, setServerError] = useState<string | null>(null);
    const createStudent = useCreateStudent();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateStudentFormValues>({
        resolver: zodResolver(createStudentSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            mobileNumber: "",
            email: "",
            admissionNumber: "",
            dateOfBirth: "",
        },
    });

    async function onSubmit(values: CreateStudentFormValues): Promise<void> {
        setServerError(null);
        try {
            const result = await createStudent.mutateAsync({
                firstName: values.firstName,
                lastName: values.lastName,
                mobileNumber: values.mobileNumber,
                email: emptyToUndefined(values.email),
                admissionNumber: values.admissionNumber,
                dateOfBirth: emptyToUndefined(values.dateOfBirth),
            });
            onCreated(result.user, result.tempPassword);
        } catch (error) {
            setServerError(getUserErrorMessage(error));
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-6" noValidate>
            <ServerError message={serverError} />
            <BaseUserFields register={register} errors={errors} />
            <FormSection title="Student details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        label="Admission number"
                        htmlFor="admissionNumber"
                        required
                        error={errors.admissionNumber?.message}
                    >
                        <Input
                            id="admissionNumber"
                            placeholder="e.g. ADM001"
                            {...register("admissionNumber")}
                        />
                    </Field>
                    <Field
                        label="Date of birth"
                        htmlFor="dateOfBirth"
                        error={errors.dateOfBirth?.message}
                    >
                        <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                    </Field>
                </div>
            </FormSection>
            <FormActions isSubmitting={isSubmitting} label="Create student" />
        </form>
    );
}
