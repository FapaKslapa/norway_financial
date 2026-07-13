import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
  BREVO_API_KEY: z.string().optional(),
  BREVO_FROM_EMAIL: z.email().optional(),
  BREVO_FROM_NAME: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

let parsedEnv: z.infer<typeof envSchema>;

try {
  parsedEnv = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
    BREVO_FROM_NAME: process.env.BREVO_FROM_NAME,
    NODE_ENV: process.env.NODE_ENV,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Invalid environment variables:");
    for (const err of error.issues) {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    }
  } else {
    console.error("Environment validation error:", error);
  }
  throw new Error("Invalid environment variables. Fix them in your .env file.");
}

export const env = parsedEnv;
