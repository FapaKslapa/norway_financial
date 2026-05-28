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

function wrapDrizzle(dbInstance: object): object {
  return new Proxy(dbInstance as DbRecord, {
    get(target, prop, receiver) {
      if (prop === "delete") {
        return (...args: unknown[]) => {
          const builder = (target.delete as AnyFn)(...args) as DbRecord;
          return new Proxy(builder, {
            get(builderTarget, builderProp) {
              if (builderProp === "execute" || builderProp === "then") {
                const originalMethod = builderTarget[builderProp] as
                  | AnyFn
                  | undefined;
                return (...execArgs: unknown[]) => {
                  const result = originalMethod?.apply(builderTarget, execArgs);
                  if (result instanceof Promise) {
                    return result.then((res: unknown) => {
                      if (Array.isArray(res) && res[0] !== undefined) {
                        const header = res[0] as {
                          affectedRows?: number;
                          rowsAffected?: number;
                          changes?: number;
                        };
                        Object.defineProperty(res, "affectedRows", {
                          value: header.affectedRows,
                          writable: true,
                          configurable: true,
                        });
                        Object.defineProperty(res, "rowsAffected", {
                          value: header.rowsAffected,
                          writable: true,
                          configurable: true,
                        });
                        Object.defineProperty(res, "changes", {
                          value: header.changes,
                          writable: true,
                          configurable: true,
                        });
                      }
                      return res;
                    });
                  }
                  return result;
                };
              }
              return Reflect.get(builderTarget, builderProp);
            },
          });
        };
      }

      if (prop === "transaction") {
        return (
          callback: (tx: object) => Promise<unknown>,
          ...args: unknown[]
        ) => {
          const wrappedCallback = async (tx: object) => {
            return callback(wrapDrizzle(tx));
          };
          return (target.transaction as AnyFn)(wrappedCallback, ...args);
        };
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });
}

export const auth = betterAuth({
  database: drizzleAdapter(wrapDrizzle(db), {
    provider: "mysql",
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
