import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { magicLinkEmail, sendEmail } from "./brevo";

type DbRecord = Record<PropertyKey, unknown>;
type AnyFn = (...args: unknown[]) => unknown;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    magicLink({
      disableSignUp: true,
      sendMagicLink: async ({ email, url }) => {
        const users = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.email, email))
          .limit(1);

        if (users.length > 0 && !users[0].emailVerified) {
          throw new Error(
            "Il tuo account non è ancora attivato. Controlla la tua email per il link di attivazione.",
          );
        }

        const landingUrl = url.replace(
          "/api/auth/magic-link/verify",
          "/auth/verify",
        );

        try {
          await sendEmail({
            to: email,
            subject: "Il tuo link di accesso — Gravio",
            ...magicLinkEmail(landingUrl),
          });
        } catch (err) {
          console.error("[AUTH] sendMagicLink failed:", err);
          throw err;
        }
      },
    }),
  ],
});
