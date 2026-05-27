import crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { user, verification } from "@/db/schema";
import { env } from "@/env";
import { activationEmail, sendEmail } from "@/lib/brevo";
import { publicProcedure, router } from "@/server/trpc";

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Il nome è obbligatorio"),
        email: z.string().email("Email non valida"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db
        .select()
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        if (existing[0].emailVerified) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email già registrata. Accedi con Magic Link.",
          });
        }
        await ctx.db
          .update(user)
          .set({ name: input.name, updatedAt: new Date() })
          .where(eq(user.email, input.email));
        await ctx.db
          .delete(verification)
          .where(eq(verification.identifier, `activate:${input.email}`));
      } else {
        const userId = crypto.randomUUID();
        const now = new Date();
        await ctx.db.insert(user).values({
          id: userId,
          name: input.name,
          email: input.email,
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const now = new Date();
      await ctx.db.insert(verification).values({
        id: crypto.randomUUID(),
        identifier: `activate:${input.email}`,
        value: token,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      });

      const activationUrl = `${env.BETTER_AUTH_URL}/auth/activate?token=${token}&email=${encodeURIComponent(input.email)}`;

      await sendEmail({
        to: input.email,
        toName: input.name,
        subject: "Attiva il tuo account — GlobeFinance",
        ...activationEmail(activationUrl, input.name),
      });

      return { success: true };
    }),

  activate: publicProcedure
    .input(
      z.object({
        token: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tokens = await ctx.db
        .select()
        .from(verification)
        .where(
          and(
            eq(verification.identifier, `activate:${input.email}`),
            eq(verification.value, input.token),
            gte(verification.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (tokens.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link non valido o scaduto. Registrati di nuovo.",
        });
      }

      await ctx.db
        .update(user)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(user.email, input.email));

      await ctx.db
        .delete(verification)
        .where(eq(verification.id, tokens[0].id));

      return { success: true };
    }),
});
