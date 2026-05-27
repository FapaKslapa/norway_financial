import crypto from "node:crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
} from "drizzle-orm";
import { sharedExpense, transaction, user } from "@/db/schema";
import {
  createManyTransactionsSchema,
  createTransactionSchema,
  deleteTransactionSchema,
  listTransactionsSchema,
} from "@/lib/schemas/transaction";
import { protectedProcedure, router } from "@/server/trpc";

function convertAmounts(
  amount: number,
  currency: string,
  exchangeRate: number,
  exchangeRateNok = 11.85,
) {
  const amountEur = currency === "EUR" ? amount : amount / exchangeRate;
  const amountNok = amountEur * exchangeRateNok;
  return { amountEur, amountNok };
}

function computeFriendSplitNok(
  amountNok: number,
  mode: string,
  value?: number,
): number {
  switch (mode) {
    case "percentage":
      return amountNok * ((value ?? 50) / 100);
    case "exact":
      return Math.min(value ?? amountNok / 2, amountNok);
    case "thirds":
      return amountNok / 3;
    case "custom_n":
      return amountNok / Math.max(value ?? 2, 2);
    default:
      return amountNok / 2;
  }
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
      if (input?.search) {
        conditions.push(like(transaction.description, `%${input.search}%`));
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
        input.exchangeRateNok ?? 11.85,
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
        groupId: input.groupId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(transaction).values(newTransaction);

      if (
        input.groupId &&
        input.groupSplits &&
        input.groupSplits.length > 0 &&
        input.type === "expense"
      ) {
        const splitsToInsert = input.groupSplits.map((s) => ({
          id: crypto.randomUUID(),
          transactionId: newTransaction.id,
          payerId: userId,
          borrowerId: s.userId,
          amountNok: amountNok.toFixed(2),
          splitAmountNok: s.amountNok.toFixed(2),
          settled: false,
          groupId: input.groupId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        await ctx.db.insert(sharedExpense).values(splitsToInsert);
      } else if (input.sharedWithUserId && input.type === "expense") {
        const friendSplitNok = computeFriendSplitNok(
          amountNok,
          input.splitMode ?? "half",
          input.splitValue,
        );
        await ctx.db.insert(sharedExpense).values({
          id: crypto.randomUUID(),
          transactionId: newTransaction.id,
          payerId: userId,
          borrowerId: input.sharedWithUserId,
          amountNok: amountNok.toFixed(2),
          splitAmountNok: friendSplitNok.toFixed(2),
          settled: false,
          groupId: null,
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
          item.exchangeRateNok ?? 11.85,
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

  listPaginated: protectedProcedure
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
      if (input?.search) {
        conditions.push(like(transaction.description, `%${input.search}%`));
      }

      const [countRes] = await ctx.db
        .select({ count: count() })
        .from(transaction)
        .leftJoin(
          sharedExpense,
          eq(transaction.id, sharedExpense.transactionId),
        )
        .where(
          and(
            or(
              eq(transaction.userId, userId),
              eq(sharedExpense.borrowerId, userId),
            ),
            ...conditions,
          ),
        );

      const totalCount = countRes?.count ?? 0;

      let orderByClause = desc(transaction.date);
      const direction = input?.sortDirection === "asc" ? asc : desc;

      if (input?.sortField === "description") {
        orderByClause = direction(transaction.description);
      } else if (input?.sortField === "type") {
        orderByClause = direction(transaction.type);
      } else if (input?.sortField === "amount") {
        orderByClause = direction(transaction.amountNok);
      } else if (input?.sortField === "category") {
        orderByClause = direction(transaction.categoryId);
      } else {
        orderByClause = direction(transaction.date);
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const offset = (page - 1) * limit;

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
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

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

      const items = rawTxs.map((row) => {
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

      return {
        items,
        totalCount,
      };
    }),
});
