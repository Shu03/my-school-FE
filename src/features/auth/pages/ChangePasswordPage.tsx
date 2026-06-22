import type { JSX } from "react";
import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";

import { ROUTES } from "@constants/routes.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { changePassword } from "../api/auth.api";
import { PasswordPolicyDisplay } from "../components/PasswordPolicyDisplay";
import {
    firstLoginPasswordChangeSchema,
    voluntaryPasswordChangeSchema,
    validatePasswordPolicy,
    isPasswordPolicyValid,
    type FirstLoginPasswordChangeValues,
    type VoluntaryPasswordChangeValues,
} from "../schemas/password-change.schema";
import { useAuthStore } from "../store/auth.store";

export function ChangePasswordPage(): JSX.Element {
    const navigate = useNavigate();
    const {
        login,
        clearForcePasswordChange,
        forcePasswordChange,
        firstLoginToken,
        isAuthenticated,
    } = useAuthStore();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [passwordFeedback, setPasswordFeedback] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        digit: false,
        special: false,
    });

    // Determine which mode we're in
    const isFirstLogin = forcePasswordChange && firstLoginToken;
    const isVoluntaryChange = isAuthenticated && !forcePasswordChange;

    // Select schema based on mode
    const schema = isFirstLogin ? firstLoginPasswordChangeSchema : voluntaryPasswordChangeSchema;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FirstLoginPasswordChangeValues | VoluntaryPasswordChangeValues>({
        resolver: zodResolver(schema),
        defaultValues: isFirstLogin
            ? { newPassword: "" }
            : {
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
              },
    });

    // Watch for password changes to update feedback
    const newPassword = watch("newPassword");
    const currentPassword = watch("currentPassword");

    // Update password feedback when new password changes
    useEffect(() => {
        setPasswordFeedback(validatePasswordPolicy(newPassword));
    }, [newPassword]);

    // Validate that we have a valid context and redirect if not (after all hooks)
    useEffect(() => {
        if (!isFirstLogin && !isVoluntaryChange) {
            // Not in a valid password change context, redirect to home
            navigate(ROUTES.DASHBOARD, { replace: true });
        }
    }, [isFirstLogin, isVoluntaryChange, navigate]);

    async function onSubmit(
        data: FirstLoginPasswordChangeValues | VoluntaryPasswordChangeValues,
    ): Promise<void> {
        setServerError(null);

        try {
            // Prepare payload based on mode
            const payload = isFirstLogin
                ? { newPassword: (data as FirstLoginPasswordChangeValues).newPassword }
                : {
                      currentPassword: (data as VoluntaryPasswordChangeValues).currentPassword,
                      newPassword: (data as VoluntaryPasswordChangeValues).newPassword,
                  };

            // Call change-password API with appropriate token
            const response = await changePassword(
                payload,
                isFirstLogin ? firstLoginToken : undefined,
            );

            // Success: update auth state with new tokens
            login(response.user, response.accessToken, response.refreshToken);

            // Clear forced password change state if applicable
            if (isFirstLogin) {
                clearForcePasswordChange();
            }

            // Redirect to dashboard
            navigate(ROUTES.DASHBOARD, { replace: true });
        } catch (error: unknown) {
            // Handle API errors
            if (error instanceof Error) {
                const message = error.message;

                // Parse specific error messages from API
                if (message.includes("400")) {
                    setServerError(
                        "Password does not meet requirements. Please check all policy rules.",
                    );
                } else if (message.includes("401")) {
                    setServerError("Your session has expired. Please login again.");
                    useAuthStore.getState().logout();
                    navigate(ROUTES.LOGIN, { replace: true });
                } else if (message.includes("same password")) {
                    setServerError("New password must be different from current password.");
                } else {
                    setServerError(
                        "Failed to change password. Please try again or contact support.",
                    );
                }
            } else {
                setServerError("Failed to change password. Please try again.");
            }
        }
    }

    const isPasswordValid = isPasswordPolicyValid(passwordFeedback);
    const isFormValid = isPasswordValid && (isFirstLogin || currentPassword);

    return (
        <div className="bg-muted/50 flex min-h-svh items-center justify-center px-4">
            <div className="w-full max-w-[28rem]">
                {/* Header */}
                <div className="mb-12 flex flex-col items-center gap-3">
                    <div className="bg-primary text-primary-foreground shadow-primary/50 flex size-12 items-center justify-center rounded-xl shadow-lg">
                        <Lock className="size-6" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isFirstLogin ? "Set Your Password" : "Change Password"}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {isFirstLogin
                                ? "Create a strong password to secure your account"
                                : "Update your password to something new"}
                        </p>
                    </div>
                </div>

                {/* Form card */}
                <div className="bg-background rounded-2xl px-8 py-10 shadow-xs">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                        noValidate
                    >
                        {serverError && (
                            <Alert variant="destructive">
                                <AlertCircle />
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Current Password (Voluntary Change Only) */}
                        {isVoluntaryChange && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="currentPassword">Current password</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Enter your current password"
                                        autoComplete="current-password"
                                        aria-invalid={
                                            isVoluntaryChange &&
                                            "currentPassword" in errors &&
                                            !!errors.currentPassword
                                        }
                                        className="pr-9"
                                        {...register("currentPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2.5 transition-colors duration-200"
                                        aria-label={
                                            showCurrentPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {isVoluntaryChange &&
                                    "currentPassword" in errors &&
                                    errors.currentPassword && (
                                        <p className="text-destructive text-xs">
                                            {errors.currentPassword.message}
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* New Password */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="newPassword">
                                {isFirstLogin ? "New password" : "New password"}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter your new password"
                                    autoComplete={isFirstLogin ? "new-password" : "new-password"}
                                    aria-invalid={!!errors.newPassword}
                                    className="pr-9"
                                    {...register("newPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2.5 transition-colors duration-200"
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-destructive text-xs">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Password Policy Feedback */}
                        <PasswordPolicyDisplay feedback={passwordFeedback} />

                        {/* Confirm Password (Voluntary Change Only) */}
                        {isVoluntaryChange && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="confirmPassword">Confirm new password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your new password"
                                        autoComplete="new-password"
                                        aria-invalid={
                                            isVoluntaryChange &&
                                            "confirmPassword" in errors &&
                                            !!errors.confirmPassword
                                        }
                                        className="pr-9"
                                        {...register("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2.5 transition-colors duration-200"
                                        aria-label={
                                            showConfirmPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                                {isVoluntaryChange &&
                                    "confirmPassword" in errors &&
                                    errors.confirmPassword && (
                                        <p className="text-destructive text-xs">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            disabled={!isFormValid || isSubmitting}
                            className="mt-2 w-full transition-all duration-200"
                        >
                            {isSubmitting && <Spinner data-icon="inline-start" />}
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </div>

                {/* Info message for first login */}
                {isFirstLogin && (
                    <p className="text-muted-foreground mt-4 text-center text-xs leading-relaxed">
                        This is your first login. You must set a strong password before accessing
                        the application.
                    </p>
                )}
            </div>
        </div>
    );
}
