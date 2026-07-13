import { eq } from "drizzle-orm";
import { z } from "zod";
import { user, userSettings } from "@/db/schema";
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
      targetMonthlyBudget: "0.00",
      maxMonthlyBudget: "0.00",
      preferredCurrency: "EUR",
      themeMode: "dark",
      themeAccent: "blue",
      aiProvider: "local",
      geminiApiKey: null,
      ollamaUrl: "http://localhost:11434",
      ollamaModel: "llama3.2:1b",
      notifyBudget80: true,
      notifyRecurrentApplied: true,
      notifyFriendActions: true,
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

      const updates: Record<string, string | Date | boolean> = {
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
      if (input.notifyBudget80 !== undefined) {
        updates.notifyBudget80 = input.notifyBudget80;
      }
      if (input.notifyRecurrentApplied !== undefined) {
        updates.notifyRecurrentApplied = input.notifyRecurrentApplied;
      }
      if (input.notifyFriendActions !== undefined) {
        updates.notifyFriendActions = input.notifyFriendActions;
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

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        image: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const updates: Record<string, string | Date | null> = {
        updatedAt: new Date(),
      };
      if (input.name !== undefined) {
        updates.name = input.name;
      }
      if (input.image !== undefined) {
        updates.image = input.image;
      }
      await ctx.db.update(user).set(updates).where(eq(user.id, userId));
      return { success: true };
    }),
});
