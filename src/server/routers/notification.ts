import { and, desc, eq } from "drizzle-orm";
import { notification } from "@/db/schema";
import { readNotificationSchema } from "@/lib/schemas/notification";
import { protectedProcedure, router } from "@/server/trpc";

export const notificationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(notification)
      .where(eq(notification.userId, ctx.session.user.id))
      .orderBy(desc(notification.createdAt));
  }),

  markRead: protectedProcedure
    .input(readNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notification)
        .set({ read: true })
        .where(
          and(
            eq(notification.id, input.id),
            eq(notification.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.userId, ctx.session.user.id));
    return { success: true };
  }),

  delete: protectedProcedure
    .input(readNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(notification)
        .where(
          and(
            eq(notification.id, input.id),
            eq(notification.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(notification)
      .where(eq(notification.userId, ctx.session.user.id));
    return { success: true };
  }),
});
