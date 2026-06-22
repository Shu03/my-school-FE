import { z } from "zod";

import { PASSWORD_POLICY } from "@constants/auth.constants";

const passwordValidation = z
    .string()
    .min(PASSWORD_POLICY.MIN_LENGTH, PASSWORD_POLICY.MESSAGES.LENGTH)
    .max(PASSWORD_POLICY.MAX_LENGTH, PASSWORD_POLICY.MESSAGES.LENGTH)
    .regex(PASSWORD_POLICY.PATTERNS.UPPERCASE, PASSWORD_POLICY.MESSAGES.UPPERCASE)
    .regex(PASSWORD_POLICY.PATTERNS.LOWERCASE, PASSWORD_POLICY.MESSAGES.LOWERCASE)
    .regex(PASSWORD_POLICY.PATTERNS.DIGIT, PASSWORD_POLICY.MESSAGES.DIGIT)
    .regex(PASSWORD_POLICY.PATTERNS.SPECIAL, PASSWORD_POLICY.MESSAGES.SPECIAL);

// First login password change (no current password required, using firstLoginToken)
export const firstLoginPasswordChangeSchema = z.object({
    newPassword: passwordValidation,
});

export type FirstLoginPasswordChangeValues = z.infer<typeof firstLoginPasswordChangeSchema>;

// Voluntary password change (requires current password)
export const voluntaryPasswordChangeSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordValidation,
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

export type VoluntaryPasswordChangeValues = z.infer<typeof voluntaryPasswordChangeSchema>;

// Combined type for either mode
export type PasswordChangeFormValues = FirstLoginPasswordChangeValues | VoluntaryPasswordChangeValues;

// Password policy validator for real-time feedback
export interface PasswordPolicyFeedback {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    digit: boolean;
    special: boolean;
}

export function validatePasswordPolicy(password: string): PasswordPolicyFeedback {
    return {
        length:
            password.length >= PASSWORD_POLICY.MIN_LENGTH &&
            password.length <= PASSWORD_POLICY.MAX_LENGTH,
        uppercase: PASSWORD_POLICY.PATTERNS.UPPERCASE.test(password),
        lowercase: PASSWORD_POLICY.PATTERNS.LOWERCASE.test(password),
        digit: PASSWORD_POLICY.PATTERNS.DIGIT.test(password),
        special: PASSWORD_POLICY.PATTERNS.SPECIAL.test(password),
    };
}

export function isPasswordPolicyValid(feedback: PasswordPolicyFeedback): boolean {
    return Object.values(feedback).every((requirement) => requirement === true);
}

export const PASSWORD_POLICY_MESSAGE_DETAILS = {
    length: PASSWORD_POLICY.MESSAGES.LENGTH,
    uppercase: PASSWORD_POLICY.MESSAGES.UPPERCASE,
    lowercase: PASSWORD_POLICY.MESSAGES.LOWERCASE,
    digit: PASSWORD_POLICY.MESSAGES.DIGIT,
    special: PASSWORD_POLICY.MESSAGES.SPECIAL,
};
