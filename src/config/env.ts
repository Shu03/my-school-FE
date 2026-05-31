import { z } from "zod";

const envSchema = z.object({
    VITE_API_BASE_URL: z.string().url("VITE_API_BASE_URL must be a valid URL"),
});

function validateEnv(): z.infer<typeof envSchema> {
    const result = envSchema.safeParse(import.meta.env);

    if (!result.success) {
        const formatted = result.error.issues
            .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
            .join("\n");

        throw new Error(`\n❌ Invalid environment variables:\n${formatted}\n`);
    }

    return result.data;
}

export const env = validateEnv();
