import { useState } from "react";
import type { JSX } from "react";

import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, GraduationCap } from "lucide-react";

import { APP_BRAND } from "@constants/app.constants";
import { HTTP_STATUS } from "@constants/httpStatus.constants";
import { ROUTES } from "@constants/routes.constants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { login } from "../api/auth.api";
import { loginSchema } from "../schemas/login.schema";
import type { LoginFormValues } from "../schemas/login.schema";
import { useAuthStore } from "../store/auth.store";
import { isForcePasswordChange } from "../types/auth.types";


/**
 * Extract error message from API error response
 * Parses status-specific error messages per auth guide
 */
function getErrorMessageFromStatus(status?: number): string {
    if (!status) {
        return "Invalid mobile number or password. Please try again.";
    }

    switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
            return "Invalid mobile number or password. Please try again.";
        case HTTP_STATUS.FORBIDDEN:
            return "Your account has been deactivated. Please contact support.";
        case HTTP_STATUS.TOO_MANY_REQUESTS:
            return "Too many login attempts. Please try again in a few moments.";
        default:
            return "Login failed. Please try again or contact support.";
    }
}

export function LoginPage(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const authLogin = useAuthStore((s) => s.login);
    const setForcePasswordChange = useAuthStore((s) => s.setForcePasswordChange);

    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Extract return-to destination from location state (if user was redirected here)
    const returnTo = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD;
    const sessionExpired =
        (location.state as { sessionExpired?: boolean } | null)?.sessionExpired ?? false;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            mobileNumber: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginFormValues): Promise<void> {
        setServerError(null);

        try {
            const response = await login(data);

            if (isForcePasswordChange(response)) {
                setForcePasswordChange(response.firstLoginToken);
                // Don't redirect yet; route guard will handle it
                navigate(ROUTES.CHANGE_PASSWORD, { replace: true });
                return;
            }

            authLogin(response.user, response.accessToken, response.refreshToken);
            // Redirect to return-to destination or dashboard (don't use return-to for first login)
            navigate(returnTo, { replace: true });
        } catch (error: unknown) {
            // Extract status code from error if available
            let status: number | undefined;
            if (error instanceof Error) {
                // Check if error message contains status code pattern
                const statusMatch = error.message.match(/(\d{3})/);
                if (statusMatch) {
                    status = parseInt(statusMatch[1], 10);
                }
            }
            const message = getErrorMessageFromStatus(status);
            setServerError(message);
        }
    }

    return (
        <div className="bg-muted/50 flex min-h-svh items-center justify-center px-4">
            <div className="w-full max-w-[26rem]">
                {/* Brand mark */}
                <div className="mb-14 flex flex-col items-center gap-3">
                    <div className="bg-primary text-primary-foreground shadow-primary/50 flex size-12 items-center justify-center rounded-xl shadow-lg">
                        <GraduationCap className="size-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">{APP_BRAND.SHORT_NAME}</span>
                </div>

                {/* Form surface — tonal layer, no border */}
                <div className="bg-background rounded-2xl px-8 py-10 shadow-xs">
                    <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                        Welcome back
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">Sign in</h1>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        Enter your mobile number and password to continue
                    </p>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 flex flex-col gap-5"
                        noValidate
                    >
                        {sessionExpired && (
                            <Alert variant="destructive">
                                <AlertCircle />
                                <AlertDescription>
                                    Your session has expired. Please log in again.
                                </AlertDescription>
                            </Alert>
                        )}

                        {serverError && (
                            <Alert variant="destructive">
                                <AlertCircle />
                                <AlertDescription>{serverError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Mobile Number */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="mobileNumber">Mobile number</Label>
                            <Input
                                id="mobileNumber"
                                type="tel"
                                inputMode="numeric"
                                placeholder="Enter 10-digit mobile number"
                                autoComplete="tel"
                                aria-invalid={!!errors.mobileNumber}
                                {...register("mobileNumber")}
                            />
                            {errors.mobileNumber && (
                                <p className="text-destructive text-xs">
                                    {errors.mobileNumber.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.password}
                                    className="pr-9"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={(): void => setShowPassword((prev) => !prev)}
                                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2.5 transition-colors duration-200"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-destructive text-xs">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            size={"lg"}
                            disabled={isSubmitting}
                            className="mt-3 w-full transition-all duration-200"
                        >
                            {isSubmitting && <Spinner data-icon="inline-start" />}
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
