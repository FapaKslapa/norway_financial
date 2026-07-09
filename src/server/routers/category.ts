import crypto from "node:crypto";
import { and, eq, isNull, or } from "drizzle-orm";
import { category } from "@/db/schema";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "@/lib/schemas/category";
import { protectedProcedure, router } from "@/server/trpc";

const DEFAULT_CATEGORIES = [
  { name: "Alloggio", icon: "Home", color: "#007AFF" },
  { name: "Cibo & Spesa", icon: "Utensils", color: "#FF9500" },
  { name: "Trasporti", icon: "Train", color: "#5856D6" },
  { name: "Divertimento & Svago", icon: "Gamepad2", color: "#FF2D55" },
  { name: "Studio & Libri", icon: "BookOpen", color: "#AF52DE" },
  { name: "Viaggi & Voli", icon: "Plane", color: "#30B0C7" },
  { name: "Stipendio & Guadagni", icon: "DollarSign", color: "#34C759" },
  { name: "Generale", icon: "Sparkles", color: "#8E8E93" },
];

export const categoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Check if shared categories exist
    const sharedCategories = await ctx.db
      .select()
      .from(category)
      .where(isNull(category.userId));

    if (sharedCategories.length === 0) {
      const seedData = DEFAULT_CATEGORIES.map((cat) => ({
        id: crypto.randomUUID(),
        userId: null,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await ctx.db.insert(category).values(seedData);
    }

    const list = await ctx.db
      .select()
      .from(category)
      .where(or(eq(category.userId, userId), isNull(category.userId)));

    return list;
  }),

  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user already has a category with this name or if there is a shared one
      const existing = await ctx.db
        .select()
        .from(category)
        .where(
          and(
            or(eq(category.userId, userId), isNull(category.userId)),
            eq(category.name, input.name),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      const newCategory = {
        id: crypto.randomUUID(),
        userId,
        name: input.name,
        icon: input.icon,
        color: input.color,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(category).values(newCategory);
      return newCategory;
    }),

  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .update(category)
        .set({
          name: input.name,
          icon: input.icon,
          color: input.color,
          updatedAt: new Date(),
        })
        .where(and(eq(category.id, input.id), eq(category.userId, userId)));

      const updated = await ctx.db
        .select()
        .from(category)
        .where(and(eq(category.id, input.id), eq(category.userId, userId)))
        .limit(1);

      return updated[0];
    }),

  delete: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(category)
        .where(and(eq(category.id, input.id), eq(category.userId, userId)));

      return { success: true };
    }),
});
