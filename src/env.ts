import { z } from "zod";
import { getRequestContext } from "@cloudflare/next-on-pages";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long"),
  BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"), // Use string instead of z.url() to be more forgiving with custom routing / localhost / edge formats
  BREVO_API_KEY: z.string().optional(),
  BREVO_FROM_EMAIL: z.email().optional(),
  BREVO_FROM_NAME: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type EnvType = z.infer<typeof envSchema>;

function getEnvValue<K extends keyof EnvType>(key: K): any {
  let ctxEnv: any = {};
  try {
    const ctx = getRequestContext() as any;
    if (ctx?.env) {
      ctxEnv = ctx.env;
    }
  } catch (e) {
    // Ignore error when outside request context (e.g. module load or build time)
  }

  const rawValue = ctxEnv[key] || process.env[key];

  if (key === "NODE_ENV" && !rawValue) {
    return "development";
  }

  return rawValue;
}

export const env = new Proxy({} as EnvType, {
  get(target, prop) {
    if (typeof prop !== "string") {
      return Reflect.get(target, prop);
    }

    const value = getEnvValue(prop as keyof EnvType);

    // Validate the field on-demand
    const fieldSchema = envSchema.shape[prop as keyof EnvType];
    if (fieldSchema) {
      const parsed = fieldSchema.safeParse(value);
      if (!parsed.success) {
        console.error(`[ENV] Validation error for key "${prop}":`, parsed.error.issues);
        // Fallback or return raw value to prevent crashing unless strictly required
        return value;
      }
      return parsed.data;
    }

    return value;
  },
});
