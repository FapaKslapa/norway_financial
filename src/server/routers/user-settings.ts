import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { userSettings } from "@/db/schema";
import { updateUserSettingsSchema } from "@/lib/schemas/user-settings";
import { protectedProcedure, router } from "@/server/trpc";

export const userSettingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const existing = await ctx.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const defaults = {
      id: crypto.randomUUID(),
      userId,
      targetMonthlyBudget: "10000.00",
      maxMonthlyBudget: "12000.00",
      preferredCurrency: "EUR",
      themeMode: "dark",
      themeAccent: "blue",
      aiProvider: "local",
      geminiApiKey: null,
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "llama3.2:1b",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await ctx.db.insert(userSettings).values(defaults);
    return defaults;
  }),

  update: protectedProcedure
    .input(updateUserSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const targetStr =
        typeof input.targetMonthlyBudget === "number"
          ? input.targetMonthlyBudget.toFixed(2)
          : parseFloat(input.targetMonthlyBudget as string).toFixed(2);

      const maxStr =
        typeof input.maxMonthlyBudget === "number"
          ? input.maxMonthlyBudget.toFixed(2)
          : parseFloat(input.maxMonthlyBudget as string).toFixed(2);

      const updates: Record<string, string | Date> = {
        targetMonthlyBudget: targetStr,
        maxMonthlyBudget: maxStr,
        preferredCurrency: input.preferredCurrency,
        updatedAt: new Date(),
      };

      if (input.themeMode) {
        updates.themeMode = input.themeMode;
      }
      if (input.themeAccent) {
        updates.themeAccent = input.themeAccent;
      }

      await ctx.db
        .update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, userId));

      const updated = await ctx.db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      return updated[0];
    }),
});
