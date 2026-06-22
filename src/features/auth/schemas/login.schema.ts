import { z } from "zod";

import { MOBILE_NUMBER_PATTERN } from "@constants/auth.constants";

export const loginSchema = z.object({
    mobileNumber: z
        .string()
        .min(1, "Mobile number is required")
        .regex(MOBILE_NUMBER_PATTERN, "Enter a valid 10-digit mobile number"),
    password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
