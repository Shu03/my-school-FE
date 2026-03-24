import { z } from "zod";

export const loginSchema = z.object({
    mobileNumber: z
        .string()
        .min(1, "Mobile number is required")
        .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
    password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
