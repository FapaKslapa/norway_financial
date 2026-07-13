import { and, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import {
  friendship,
  notification,
  sharedExpense,
  transaction,
  user,
} from "@/db/schema";
import {
  respondFriendRequestSchema,
  sendFriendRequestSchema,
  settleDebtSchema,
} from "@/lib/schemas/friend";
import { protectedProcedure, router } from "@/server/trpc";

export const friendRouter = router({
  sendRequest: protectedProcedure
    .input(sendFriendRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.email.toLowerCase() === ctx.session.user.email.toLowerCase()) {
        throw new Error(
          "Non puoi inviare una richiesta di amicizia a te stesso",
        );
      }

      const targetUsers = await ctx.db
        .select()
        .from(user)
        .where(eq(user.email, input.email.toLowerCase()))
        .limit(1);

      if (targetUsers.length === 0) {
        throw new Error("Nessun utente trovato con questa email");
      }

      const targetUser = targetUsers[0];

      const existing = await ctx.db
        .select()
        .from(friendship)
        .where(
          or(
            and(
              eq(friendship.userId, userId),
              eq(friendship.friendId, targetUser.id),
            ),
            and(
              eq(friendship.userId, targetUser.id),
              eq(friendship.friendId, userId),
            ),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Esiste già una richiesta pendente o siete già amici");
      }

      const newRequest = {
        id: crypto.randomUUID(),
        userId: userId,
        friendId: targetUser.id,
        status: "pending",
        senderId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.db.insert(friendship).values(newRequest);

      await ctx.db.insert(notification).values({
        id: crypto.randomUUID(),
        userId: targetUser.id,
        type: "friend_request_received",
        title: "Richiesta di amicizia",
        message: `${ctx.session.user.name || ctx.session.user.email} ti ha inviato una richiesta di amicizia.`,
        read: false,
        link: "/friends",
        createdAt: new Date(),
      });

      return { success: true };
    }),

  respondRequest: protectedProcedure
    .input(respondFriendRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const requests = await ctx.db
        .select()
        .from(friendship)
        .where(
          and(
            eq(friendship.id, input.requestId),
            eq(friendship.friendId, userId),
            eq(friendship.status, "pending"),
          ),
        )
        .limit(1);

      if (requests.length === 0) {
        throw new Error("Richiesta di amicizia non trovata o non autorizzata");
      }

      const req = requests[0];

      if (input.action === "accept") {
        await ctx.db
          .update(friendship)
          .set({ status: "accepted", updatedAt: new Date() })
          .where(eq(friendship.id, req.id));

        await ctx.db.insert(notification).values({
          id: crypto.randomUUID(),
          userId: req.userId,
          type: "friend_request_accepted",
          title: "Richiesta accettata",
          message: `${ctx.session.user.name || ctx.session.user.email} ha accettato la tua richiesta di amicizia.`,
          read: false,
          link: "/friends",
          createdAt: new Date(),
        });
      } else {
        await ctx.db.delete(friendship).where(eq(friendship.id, req.id));
      }

      return { success: true };
    }),

  listFriends: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const friendships = await ctx.db
      .select()
      .from(friendship)
      .where(
        and(
          eq(friendship.status, "accepted"),
          or(eq(friendship.userId, userId), eq(friendship.friendId, userId)),
        ),
      );

    if (friendships.length === 0) return [];

    const friendIds = Array.from(
      new Set(
        friendships
          .map((f) => (f.userId === userId ? f.friendId : f.userId))
          .filter((id): id is string => typeof id === "string" && !!id),
      ),
    );

    if (friendIds.length === 0) return [];

    const friendUsers = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(inArray(user.id, friendIds));

    const userMap = new Map(friendUsers.map((u) => [u.id, u]));

    return friendships
      .map((f) => {
        const friendUserId = f.userId === userId ? f.friendId : f.userId;
        const friendUser = userMap.get(friendUserId);
        if (!friendUser) return null;
        return { friendshipId: f.id, user: friendUser, createdAt: f.createdAt };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }),

  listPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [incoming, outgoing] = await Promise.all([
      ctx.db
        .select()
        .from(friendship)
        .where(
          and(
            eq(friendship.friendId, userId),
            eq(friendship.status, "pending"),
          ),
        ),
      ctx.db
        .select()
        .from(friendship)
        .where(
          and(eq(friendship.userId, userId), eq(friendship.status, "pending")),
        ),
    ]);

    const allUserIds = Array.from(
      new Set(
        [
          ...incoming.map((r) => r.userId),
          ...outgoing.map((r) => r.friendId),
        ].filter((id): id is string => typeof id === "string" && !!id),
      ),
    );

    const allUsers =
      allUserIds.length > 0
        ? await ctx.db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            })
            .from(user)
            .where(inArray(user.id, allUserIds))
        : [];

    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    return {
      incoming: incoming
        .map((req) => {
          const sender = userMap.get(req.userId);
          if (!sender) return null;
          return { id: req.id, user: sender, createdAt: req.createdAt };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
      outgoing: outgoing
        .map((req) => {
          const receiver = userMap.get(req.friendId);
          if (!receiver) return null;
          return { id: req.id, user: receiver, createdAt: req.createdAt };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    };
  }),

  getBalanceSummary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [creditExpenses, debitExpenses] = await Promise.all([
      ctx.db
        .select()
        .from(sharedExpense)
        .where(
          and(
            eq(sharedExpense.payerId, userId),
            eq(sharedExpense.settled, false),
          ),
        ),
      ctx.db
        .select()
        .from(sharedExpense)
        .where(
          and(
            eq(sharedExpense.borrowerId, userId),
            eq(sharedExpense.settled, false),
          ),
        ),
    ]);

    const balances: Record<string, number> = {};

    for (const exp of creditExpenses) {
      balances[exp.borrowerId] =
        (balances[exp.borrowerId] || 0) + parseFloat(exp.splitAmountNok);
    }
    for (const exp of debitExpenses) {
      balances[exp.payerId] =
        (balances[exp.payerId] || 0) - parseFloat(exp.splitAmountNok);
    }

    const relevantFriendIds = Object.entries(balances).flatMap(([id, bal]) =>
      Math.abs(bal) >= 0.01 ? [id] : [],
    );

    if (relevantFriendIds.length === 0) return [];

    const friendUsers = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(inArray(user.id, relevantFriendIds));

    const userMap = new Map(friendUsers.map((u) => [u.id, u]));

    return relevantFriendIds
      .map((friendUserId) => {
        const friendUser = userMap.get(friendUserId);
        if (!friendUser) return null;
        return { user: friendUser, balanceNok: balances[friendUserId] };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }),

  settleDebt: protectedProcedure
    .input(settleDebtSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const unsettledExpenses = await ctx.db
        .select()
        .from(sharedExpense)
        .where(
          and(
            eq(sharedExpense.settled, false),
            or(
              and(
                eq(sharedExpense.payerId, userId),
                eq(sharedExpense.borrowerId, input.friendId),
              ),
              and(
                eq(sharedExpense.payerId, input.friendId),
                eq(sharedExpense.borrowerId, userId),
              ),
            ),
          ),
        );

      if (unsettledExpenses.length === 0) return { success: true };

      const reimbursementTransactions = await Promise.all(
        unsettledExpenses.map(async (exp) => {
          const payerId = exp.payerId;
          const splitNok = parseFloat(exp.splitAmountNok);

          const [originalTx] = await ctx.db
            .select()
            .from(transaction)
            .where(eq(transaction.id, exp.transactionId))
            .limit(1);

          const exchangeRate = originalTx
            ? parseFloat(originalTx.exchangeRate)
            : 11.5;
          const amountEur = splitNok / exchangeRate;
          const description = originalTx
            ? `Rimborso — ${originalTx.description}`
            : "Rimborso spesa condivisa";

          return {
            id: crypto.randomUUID(),
            userId: payerId,
            categoryId: null,
            type: "income" as const,
            amount: splitNok.toFixed(2),
            currency: "NOK" as const,
            amountNok: splitNok.toFixed(2),
            amountEur: amountEur.toFixed(2),
            exchangeRate: exchangeRate.toFixed(4),
            description,
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
      );

      if (reimbursementTransactions.length > 0) {
        await ctx.db.insert(transaction).values(reimbursementTransactions);
      }

      await ctx.db
        .update(sharedExpense)
        .set({ settled: true, updatedAt: new Date() })
        .where(
          and(
            eq(sharedExpense.settled, false),
            or(
              and(
                eq(sharedExpense.payerId, userId),
                eq(sharedExpense.borrowerId, input.friendId),
              ),
              and(
                eq(sharedExpense.payerId, input.friendId),
                eq(sharedExpense.borrowerId, userId),
              ),
            ),
          ),
        );

      return { success: true };
    }),

  deleteFriend: protectedProcedure
    .input(settleDebtSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db
        .delete(friendship)
        .where(
          or(
            and(
              eq(friendship.userId, userId),
              eq(friendship.friendId, input.friendId),
            ),
            and(
              eq(friendship.userId, input.friendId),
              eq(friendship.friendId, userId),
            ),
          ),
        );

      return { success: true };
    }),

  getGroupSettlementProposals: protectedProcedure
    .input(
      z
        .object({
          groupId: z.string().nullable().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const conditions = [];

      if (input?.groupId) {
        conditions.push(eq(sharedExpense.groupId, input.groupId));
      } else {
        conditions.push(
          or(
            eq(sharedExpense.payerId, userId),
            eq(sharedExpense.borrowerId, userId),
          ),
        );
      }

      const unsettled = await ctx.db
        .select()
        .from(sharedExpense)
        .where(and(eq(sharedExpense.settled, false), ...conditions));

      if (unsettled.length === 0) return [];

      const netBalances: Record<string, number> = {};
      for (const exp of unsettled) {
        const payer = exp.payerId;
        const borrower = exp.borrowerId;
        const amount = parseFloat(exp.splitAmountNok);

        netBalances[payer] = (netBalances[payer] || 0) + amount;
        netBalances[borrower] = (netBalances[borrower] || 0) - amount;
      }

      type Participant = { id: string; balance: number };
      const debtors: Participant[] = [];
      const creditors: Participant[] = [];

      for (const [id, bal] of Object.entries(netBalances)) {
        if (bal < -0.01) {
          debtors.push({ id, balance: bal });
        } else if (bal > 0.01) {
          creditors.push({ id, balance: bal });
        }
      }

      const proposals: Array<{
        fromId: string;
        toId: string;
        amountNok: number;
      }> = [];

      let dIdx = 0;
      let cIdx = 0;

      debtors.sort((a, b) => a.balance - b.balance);
      creditors.sort((a, b) => b.balance - a.balance);

      while (dIdx < debtors.length && cIdx < creditors.length) {
        const debtor = debtors[dIdx];
        const creditor = creditors[cIdx];

        const debtAmount = Math.abs(debtor.balance);
        const creditAmount = creditor.balance;

        const settleAmount = Math.min(debtAmount, creditAmount);

        if (settleAmount > 0.01) {
          proposals.push({
            fromId: debtor.id,
            toId: creditor.id,
            amountNok: settleAmount,
          });
        }

        debtor.balance += settleAmount;
        creditor.balance -= settleAmount;

        if (Math.abs(debtor.balance) < 0.01) {
          dIdx++;
        }
        if (Math.abs(creditor.balance) < 0.01) {
          cIdx++;
        }
      }

      const allUserIds = Array.from(
        new Set([
          ...proposals.map((p) => p.fromId),
          ...proposals.map((p) => p.toId),
        ]),
      );

      if (allUserIds.length === 0) return [];

      const usersData = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(user)
        .where(inArray(user.id, allUserIds));

      const userMap = new Map(usersData.map((u) => [u.id, u]));

      return proposals
        .map((p) => {
          const fromUser = userMap.get(p.fromId);
          const toUser = userMap.get(p.toId);
          if (!fromUser || !toUser) return null;
          return {
            fromUser,
            toUser,
            amountNok: p.amountNok,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }),
});
