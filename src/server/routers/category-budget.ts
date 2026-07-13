import { and, eq } from "drizzle-orm";
import { categoryBudget } from "@/db/schema";
import {
  deleteCategoryBudgetSchema,
  setCategoryBudgetSchema,
} from "@/lib/schemas/category-budget";
import { protectedProcedure, router } from "@/server/trpc";

export const categoryBudgetRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(categoryBudget)
      .where(eq(categoryBudget.userId, ctx.session.user.id));
  }),

  set: protectedProcedure
    .input(setCategoryBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const existing = await ctx.db
        .select()
        .from(categoryBudget)
        .where(
          and(
            eq(categoryBudget.userId, userId),
            eq(categoryBudget.categoryId, input.categoryId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await ctx.db
          .update(categoryBudget)
          .set({ amount: input.amount.toFixed(2), updatedAt: new Date() })
          .where(eq(categoryBudget.id, existing[0].id));
        return { success: true };
      }

      await ctx.db.insert(categoryBudget).values({
        id: crypto.randomUUID(),
        userId,
        categoryId: input.categoryId,
        amount: input.amount.toFixed(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(deleteCategoryBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(categoryBudget)
        .where(
          and(
            eq(categoryBudget.id, input.id),
            eq(categoryBudget.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),
});
