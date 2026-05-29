import crypto from "node:crypto";
import { and, eq, lte } from "drizzle-orm";
import { z } from "zod";
import {
  notification,
  recurrentTransaction,
  transaction,
  userSettings,
} from "@/db/schema";
import {
  deleteRecurrentTransactionSchema,
  recurrentTransactionSchema,
} from "@/lib/schemas/recurrent-transaction";
import { convertAmounts } from "@/lib/utils";
import { protectedProcedure, router } from "@/server/trpc";

function getNextOccurrenceDate(current: Date, frequency: string): Date {
  const next = new Date(current);
  if (frequency === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (frequency === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

export const recurrentTransactionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(recurrentTransaction)
      .where(eq(recurrentTransaction.userId, ctx.session.user.id));
  }),

  create: protectedProcedure
    .input(recurrentTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const id = crypto.randomUUID();
      const startD = new Date(input.startDate);
      const endD = input.endDate ? new Date(input.endDate) : null;

      await ctx.db.insert(recurrentTransaction).values({
        id,
        userId,
        categoryId: input.categoryId || null,
        type: input.type,
        amount: input.amount.toFixed(2),
        currency: input.currency,
        description: input.description,
        frequency: input.frequency,
        startDate: startD,
        nextOccurrence: startD,
        status: input.status ?? "active",
        endDate: endD,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        categoryId: z.string().nullable().optional(),
        type: z.enum(["income", "expense"]),
        amount: z.number().positive(),
        currency: z.string().length(3),
        description: z.string().min(1),
        frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
        startDate: z.string().or(z.date()),
        status: z.enum(["active", "paused"]).optional(),
        endDate: z.string().or(z.date()).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const startD = new Date(input.startDate);
      const endD = input.endDate ? new Date(input.endDate) : null;

      await ctx.db
        .update(recurrentTransaction)
        .set({
          categoryId: input.categoryId || null,
          type: input.type,
          amount: input.amount.toFixed(2),
          currency: input.currency,
          description: input.description,
          frequency: input.frequency,
          startDate: startD,
          status: input.status,
          endDate: endD,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(recurrentTransaction.id, input.id),
            eq(recurrentTransaction.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  toggleStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum(["active", "paused"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recurrentTransaction)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(recurrentTransaction.id, input.id),
            eq(recurrentTransaction.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(deleteRecurrentTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(recurrentTransaction)
        .where(
          and(
            eq(recurrentTransaction.id, input.id),
            eq(recurrentTransaction.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  processDue: protectedProcedure
    .input(
      z
        .object({
          rates: z.record(z.string(), z.number()).optional(),
        })
        .optional(),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const rates = (input?.rates as Record<string, number> | undefined) || {
        NOK: 11.85,
        EUR: 1.0,
      };
      const now = new Date();

      const [settingsRow, due] = await Promise.all([
        ctx.db
          .select({
            notifyRecurrentApplied: userSettings.notifyRecurrentApplied,
          })
          .from(userSettings)
          .where(eq(userSettings.userId, userId))
          .limit(1),
        ctx.db
          .select()
          .from(recurrentTransaction)
          .where(
            and(
              eq(recurrentTransaction.userId, userId),
              eq(recurrentTransaction.status, "active"),
              lte(recurrentTransaction.nextOccurrence, now),
            ),
          ),
      ]);

      const notifyRecurrentApplied =
        settingsRow[0]?.notifyRecurrentApplied ?? true;
      let processedCount = 0;

      for (const rt of due) {
        let occurrence = new Date(rt.nextOccurrence);
        const endDate = rt.endDate ? new Date(rt.endDate) : null;
        const txsToInsert = [];

        const currencyRate = rates[rt.currency] ?? 1.0;
        const { amountEur, amountNok } = convertAmounts(
          parseFloat(rt.amount),
          rt.currency,
          currencyRate,
          rates.NOK ?? 11.85,
        );

        while (occurrence <= now) {
          if (endDate && occurrence > endDate) {
            break;
          }
          txsToInsert.push({
            id: crypto.randomUUID(),
            userId,
            categoryId: rt.categoryId,
            type: rt.type,
            amount: rt.amount,
            currency: rt.currency,
            amountEur: amountEur.toFixed(2),
            amountNok: amountNok.toFixed(2),
            exchangeRate: currencyRate.toFixed(4),
            description: rt.description,
            date: new Date(occurrence),
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          occurrence = getNextOccurrenceDate(occurrence, rt.frequency);
        }

        if (txsToInsert.length > 0) {
          await ctx.db.insert(transaction).values(txsToInsert);

          await ctx.db
            .update(recurrentTransaction)
            .set({
              nextOccurrence: occurrence,
              lastExecuted: now,
              updatedAt: now,
            })
            .where(eq(recurrentTransaction.id, rt.id));

          if (notifyRecurrentApplied) {
            await ctx.db.insert(notification).values({
              id: crypto.randomUUID(),
              userId,
              type: "recurrent_executed",
              title: "Transazione ricorrente eseguita",
              message: `Eseguita: ${rt.description} (${rt.amount} ${rt.currency}) x${txsToInsert.length}`,
              read: false,
              link: "/transactions",
              createdAt: new Date(),
            });
          }

          processedCount += txsToInsert.length;
        }
      }

      return { success: true, processedCount };
    }),
});
