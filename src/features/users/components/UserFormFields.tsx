import type { JSX } from "react";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

import { Field } from "./Field";

/** Common base fields shared by every create form. */
export interface BaseUserFieldValues {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
}

/** Inline destructive alert for server-side submission errors. */
export function ServerError({ message }: { message: string | null }): JSX.Element | null {
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

/** First name, last name, mobile number and email — shared across all create forms. */
export function BaseUserFields<T extends BaseUserFieldValues>({
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
