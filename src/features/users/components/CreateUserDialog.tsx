import { useState } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCreateAdmin, useCreateStudent, useCreateTeacher } from "../hooks/useUsers";
import { getUserErrorMessage } from "../lib/errors";
import {
    createAdminSchema,
    createStudentSchema,
    createTeacherSchema,
    type CreateAdminFormValues,
    type CreateStudentFormValues,
    type CreateTeacherFormValues,
} from "../schemas/user.schema";
import type { User } from "../types/user.types";

import { Field } from "./Field";

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (user: User, tempPassword: string) => void;
}

/** Normalizes an optional text input: blank strings become `undefined`. */
function emptyToUndefined(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

export function CreateUserDialog({
    open,
    onOpenChange,
    onCreated,
}: CreateUserDialogProps): JSX.Element {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create user</DialogTitle>
                    <DialogDescription>
                        Choose a role and fill in the details. A temporary password is generated
                        automatically.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="ADMIN">
                    <TabsList className="w-full">
                        <TabsTrigger value="ADMIN">Admin</TabsTrigger>
                        <TabsTrigger value="TEACHER">Teacher</TabsTrigger>
                        <TabsTrigger value="STUDENT">Student</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ADMIN">
                        <AdminForm onCreated={onCreated} />
                    </TabsContent>
                    <TabsContent value="TEACHER">
                        <TeacherForm onCreated={onCreated} />
                    </TabsContent>
                    <TabsContent value="STUDENT">
                        <StudentForm onCreated={onCreated} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

interface RoleFormProps {
    onCreated: (user: User, tempPassword: string) => void;
}

/** Common base fields shared by every create form. */
interface BaseUserFieldValues {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
}

function ServerError({ message }: { message: string | null }): JSX.Element | null {
    if (!message) {
        return null;
    }
    return (
        <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

function BaseUserFields<T extends BaseUserFieldValues>({
    register,
    errors,
}: {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
}): JSX.Element {
    // Field names are shared across all create schemas; the cast keeps RHF happy.
    const reg = register as unknown as UseFormRegister<BaseUserFieldValues>;
    const err = errors as unknown as FieldErrors<BaseUserFieldValues>;
    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                    label="First name"
                    htmlFor="firstName"
                    required
                    error={err.firstName?.message}
                >
                    <Input id="firstName" autoComplete="given-name" {...reg("firstName")} />
                </Field>
                <Field label="Last name" htmlFor="lastName" required error={err.lastName?.message}>
                    <Input id="lastName" autoComplete="family-name" {...reg("lastName")} />
                </Field>
            </div>
            <Field
                label="Mobile number"
                htmlFor="mobileNumber"
                required
                error={err.mobileNumber?.message}
            >
                <Input
                    id="mobileNumber"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    {...reg("mobileNumber")}
                />
            </Field>
            <Field label="Email" htmlFor="email" error={err.email?.message}>
                <Input
                    id="email"
                    type="email"
                    placeholder="Optional"
                    autoComplete="email"
                    {...reg("email")}
                />
            </Field>
        </>
    );
}

function SubmitRow({ isSubmitting, label }: { isSubmitting: boolean; label: string }): JSX.Element {
    return (
        <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner />}
                {label}
            </Button>
        </DialogFooter>
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
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4" noValidate>
            <ServerError message={serverError} />
            <BaseUserFields register={register} errors={errors} />
            <SubmitRow isSubmitting={isSubmitting} label="Create admin" />
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
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4" noValidate>
            <ServerError message={serverError} />
            <BaseUserFields register={register} errors={errors} />
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
            <SubmitRow isSubmitting={isSubmitting} label="Create teacher" />
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
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4" noValidate>
            <ServerError message={serverError} />
            <BaseUserFields register={register} errors={errors} />
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
            <SubmitRow isSubmitting={isSubmitting} label="Create student" />
        </form>
    );
}
