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
  sum,
} from "drizzle-orm";
import type { db as DatabaseType } from "@/db";
import {
  categoryBudget,
  notification,
  sharedExpense,
  transaction,
  user,
  userSettings,
} from "@/db/schema";
import {
  createManyTransactionsSchema,
  createTransactionSchema,
  deleteTransactionSchema,
  listTransactionsSchema,
  updateTransactionSchema,
} from "@/lib/schemas/transaction";
import { convertAmounts } from "@/lib/utils";
import { protectedProcedure, router } from "@/server/trpc";

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

async function createUniqueNotification(
  db: typeof DatabaseType,
  userId: string,
  type: string,
  title: string,
  message: string,
  startOfMonth: Date,
  endOfMonth: Date,
) {
  const existing = await db
    .select()
    .from(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.type, type),
        gte(notification.createdAt, startOfMonth),
        lte(notification.createdAt, endOfMonth),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(notification).values({
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    });
  }
}

async function triggerBudgetNotifications(
  db: typeof DatabaseType,
  userId: string,
  categoryId: string | null,
  date: Date,
) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (settings.length > 0) {
    const s = settings[0];
    const targetNok = parseFloat(s.targetMonthlyBudget);
    const maxNok = parseFloat(s.maxMonthlyBudget);

    if (s.notifyBudget80 && (targetNok > 0 || maxNok > 0)) {
      const totalExpenseRes = await db
        .select({ total: sum(transaction.amountNok) })
        .from(transaction)
        .where(
          and(
            eq(transaction.userId, userId),
            eq(transaction.type, "expense"),
            gte(transaction.date, startOfMonth),
            lte(transaction.date, endOfMonth),
          ),
        );

      const totalSpentNok = parseFloat(totalExpenseRes[0]?.total || "0");

      if (targetNok > 0) {
        const pct = totalSpentNok / targetNok;
        if (pct >= 1.0) {
          await createUniqueNotification(
            db,
            userId,
            "budget_100",
            "Budget Target Raggiunto",
            `Hai speso il 100% del tuo budget target mensile (${totalSpentNok.toFixed(2)} NOK).`,
            startOfMonth,
            endOfMonth,
          );
        } else if (pct >= 0.8) {
          await createUniqueNotification(
            db,
            userId,
            "budget_80",
            "Budget Target all'80%",
            `Hai speso l'80% del tuo budget target mensile (${totalSpentNok.toFixed(2)} NOK).`,
            startOfMonth,
            endOfMonth,
          );
        }
      }

      if (maxNok > 0 && totalSpentNok >= maxNok) {
        await createUniqueNotification(
          db,
          userId,
          "budget_max",
          "Budget Massimo Superato",
          `Attenzione: hai superato il budget massimo mensile (${totalSpentNok.toFixed(2)} / ${maxNok.toFixed(2)} NOK).`,
          startOfMonth,
          endOfMonth,
        );
      }
    }
  }

  if (categoryId) {
    const catBudget = await db
      .select()
      .from(categoryBudget)
      .where(
        and(
          eq(categoryBudget.userId, userId),
          eq(categoryBudget.categoryId, categoryId),
        ),
      )
      .limit(1);

    if (catBudget.length > 0) {
      const budgetNok = parseFloat(catBudget[0].amount);
      if (budgetNok > 0) {
        const catSpentRes = await db
          .select({ total: sum(transaction.amountNok) })
          .from(transaction)
          .where(
            and(
              eq(transaction.userId, userId),
              eq(transaction.type, "expense"),
              eq(transaction.categoryId, categoryId),
              gte(transaction.date, startOfMonth),
              lte(transaction.date, endOfMonth),
            ),
          );

        const catSpentNok = parseFloat(catSpentRes[0]?.total || "0");
        const pct = catSpentNok / budgetNok;

        if (pct >= 1.0) {
          await createUniqueNotification(
            db,
            userId,
            `cat_100_${categoryId}`,
            "Budget Categoria Superato",
            `Hai speso il 100% del budget per questa categoria (${catSpentNok.toFixed(2)} NOK).`,
            startOfMonth,
            endOfMonth,
          );
        } else if (pct >= 0.8) {
          await createUniqueNotification(
            db,
            userId,
            `cat_80_${categoryId}`,
            "Budget Categoria all'80%",
            `Hai speso l'80% del budget per questa categoria (${catSpentNok.toFixed(2)} NOK).`,
            startOfMonth,
            endOfMonth,
          );
        }
      }
    }
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

        const borrowerIds = splitsToInsert.map((s) => s.borrowerId);
        const borrowerSettingsList = await ctx.db
          .select({
            userId: userSettings.userId,
            notifyFriendActions: userSettings.notifyFriendActions,
          })
          .from(userSettings)
          .where(inArray(userSettings.userId, borrowerIds));

        const borrowerSettingsMap = new Map(
          borrowerSettingsList.map((bs) => [bs.userId, bs]),
        );

        const notificationsToInsert = splitsToInsert.flatMap((s) => {
          const bs = borrowerSettingsMap.get(s.borrowerId);
          if (!bs || bs.notifyFriendActions) {
            return [
              {
                id: crypto.randomUUID(),
                userId: s.borrowerId,
                type: "shared_expense_added",
                title: "Nuova spesa di gruppo",
                message: `${ctx.session.user.name || ctx.session.user.email} ha aggiunto una spesa "${newTransaction.description}" nel gruppo.`,
                read: false,
                link: "/friends",
                createdAt: new Date(),
              },
            ];
          }
          return [];
        });

        if (notificationsToInsert.length > 0) {
          await ctx.db.insert(notification).values(notificationsToInsert);
        }
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

        const borrowerSettings = await ctx.db
          .select({ notifyFriendActions: userSettings.notifyFriendActions })
          .from(userSettings)
          .where(eq(userSettings.userId, input.sharedWithUserId))
          .limit(1);
        if (borrowerSettings[0]?.notifyFriendActions !== false) {
          await ctx.db.insert(notification).values({
            id: crypto.randomUUID(),
            userId: input.sharedWithUserId,
            type: "shared_expense_added",
            title: "Spesa condivisa",
            message: `${ctx.session.user.name || ctx.session.user.email} ha condiviso una spesa con te: "${newTransaction.description}".`,
            read: false,
            link: "/friends",
            createdAt: new Date(),
          });
        }
      }

      if (input.type === "expense") {
        await triggerBudgetNotifications(
          ctx.db,
          userId,
          input.categoryId || null,
          newTransaction.date,
        );
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

      const expenseTxs = valuesToInsert.filter((t) => t.type === "expense");
      if (expenseTxs.length > 0) {
        const first = expenseTxs[0];
        await triggerBudgetNotifications(
          ctx.db,
          userId,
          first.categoryId,
          first.date,
        );
      }

      return { count: valuesToInsert.length };
    }),

  delete: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // If the user owns the transaction, delete it entirely (cascades to sharedExpense)
      const [owned] = await ctx.db
        .select({ id: transaction.id })
        .from(transaction)
        .where(
          and(eq(transaction.id, input.id), eq(transaction.userId, userId)),
        )
        .limit(1);

      if (owned) {
        await ctx.db.delete(transaction).where(eq(transaction.id, input.id));
        return { success: true };
      }

      // Otherwise, if the user is a borrower on this transaction, remove only the split
      await ctx.db
        .delete(sharedExpense)
        .where(
          and(
            eq(sharedExpense.transactionId, input.id),
            eq(sharedExpense.borrowerId, userId),
          ),
        );

      return { success: true };
    }),

  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { amountEur, amountNok } = convertAmounts(
        input.amount,
        input.currency,
        input.exchangeRate,
        input.exchangeRateNok ?? 11.85,
      );

      await ctx.db
        .update(transaction)
        .set({
          categoryId: input.categoryId || null,
          type: input.type,
          amount: input.amount.toFixed(2),
          currency: input.currency,
          amountEur: amountEur.toFixed(2),
          amountNok: amountNok.toFixed(2),
          exchangeRate: input.exchangeRate.toFixed(4),
          description: input.description || "",
          date: new Date(input.date),
          updatedAt: new Date(),
        })
        .where(
          and(eq(transaction.id, input.id), eq(transaction.userId, userId)),
        );

      if (input.type === "expense") {
        await triggerBudgetNotifications(
          ctx.db,
          userId,
          input.categoryId || null,
          new Date(input.date),
        );
      }

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
