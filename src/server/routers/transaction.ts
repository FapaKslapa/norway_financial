import crypto from "node:crypto";
import { and, desc, eq, gte, inArray, lte, or } from "drizzle-orm";
import { sharedExpense, transaction, user } from "../../db/schema";
import {
  createManyTransactionsSchema,
  createTransactionSchema,
  deleteTransactionSchema,
  listTransactionsSchema,
} from "../../lib/schemas/transaction";
import { protectedProcedure, router } from "../trpc";

function convertAmounts(
  amount: number,
  currency: string,
  exchangeRate: number,
) {
  if (currency === "EUR") {
    return { amountEur: amount, amountNok: amount * exchangeRate };
  }
  return { amountNok: amount, amountEur: amount / exchangeRate };
}

export const transactionRouter = router({
  list: protectedProcedure
    .input(listTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const conditions = [];

      if (input?.categoryId) {
        conditions.push(eq(transaction.categoryId, input.categoryId));
      }
      if (input?.type) {
        conditions.push(eq(transaction.type, input.type));
      }
      if (input?.startDate) {
        conditions.push(gte(transaction.date, new Date(input.startDate)));
      }
      if (input?.endDate) {
        conditions.push(lte(transaction.date, new Date(input.endDate)));
      }

      const rawTxs = await ctx.db
        .select({
          transaction: transaction,
          shared: sharedExpense,
          payerName: user.name,
          payerEmail: user.email,
        })
        .from(transaction)
        .leftJoin(
          sharedExpense,
          eq(transaction.id, sharedExpense.transactionId),
        )
        .leftJoin(user, eq(transaction.userId, user.id))
        .where(
          and(
            or(
              eq(transaction.userId, userId),
              eq(sharedExpense.borrowerId, userId),
            ),
            ...conditions,
          ),
        )
        .orderBy(desc(transaction.date));

      const borrowerIds = rawTxs
        .map((r) => r.shared?.borrowerId)
        .filter((id): id is string => !!id);

      const borrowerUsers =
        borrowerIds.length > 0
          ? await ctx.db
              .select({ id: user.id, name: user.name, email: user.email })
              .from(user)
              .where(inArray(user.id, borrowerIds))
          : [];

      const borrowerMap = new Map(borrowerUsers.map((u) => [u.id, u]));

      return rawTxs.map((row) => {
        const tx = row.transaction;
        const shared = row.shared;
        const borrower = shared ? borrowerMap.get(shared.borrowerId) : null;

        return {
          ...tx,
          payerName: row.payerName,
          payerEmail: row.payerEmail,
          sharedInfo: shared
            ? {
                id: shared.id,
                payerId: shared.payerId,
                borrowerId: shared.borrowerId,
                borrowerName: borrower?.name || "Amico",
                borrowerEmail: borrower?.email || "",
                splitAmountNok: shared.splitAmountNok,
                settled: shared.settled,
                isBorrowed: shared.borrowerId === userId,
                isPaidByMe: shared.payerId === userId,
              }
            : null,
        };
      });
    }),

  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { amountEur, amountNok } = convertAmounts(
        input.amount,
        input.currency,
        input.exchangeRate,
      );

      const newTransaction = {
        id: crypto.randomUUID(),
        userId,
        categoryId: input.categoryId || null,
        type: input.type,
        amount: input.amount.toFixed(2),
        currency: input.currency,
        amountEur: amountEur.toFixed(2),
        amountNok: amountNok.toFixed(2),
        exchangeRate: input.exchangeRate.toFixed(4),
        description: input.description || "",
        date: new Date(input.date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(transaction).values(newTransaction);

      if (input.sharedWithUserId && input.type === "expense") {
        const splitVal = amountNok / 2;
        await ctx.db.insert(sharedExpense).values({
          id: crypto.randomUUID(),
          transactionId: newTransaction.id,
          payerId: userId,
          borrowerId: input.sharedWithUserId,
          amountNok: amountNok.toFixed(2),
          splitAmountNok: splitVal.toFixed(2),
          settled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return newTransaction;
    }),

  createMany: protectedProcedure
    .input(createManyTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.length === 0) return { count: 0 };

      const valuesToInsert = input.map((item) => {
        const { amountEur, amountNok } = convertAmounts(
          item.amount,
          item.currency,
          item.exchangeRate,
        );

        return {
          id: crypto.randomUUID(),
          userId,
          categoryId: item.categoryId || null,
          type: item.type,
          amount: item.amount.toFixed(2),
          currency: item.currency,
          amountEur: amountEur.toFixed(2),
          amountNok: amountNok.toFixed(2),
          exchangeRate: item.exchangeRate.toFixed(4),
          description: item.description || "",
          date: new Date(item.date),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      await ctx.db.insert(transaction).values(valuesToInsert);
      return { count: valuesToInsert.length };
    }),

  delete: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(transaction)
        .where(
          and(eq(transaction.id, input.id), eq(transaction.userId, userId)),
        );

      return { success: true };
    }),
});
