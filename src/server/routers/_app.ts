import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc";
import { authRouter } from "./auth";
import { categoryRouter } from "./category";
import { categoryBudgetRouter } from "./category-budget";
import { friendRouter } from "./friend";
import { groupRouter } from "./group";
import { notificationRouter } from "./notification";
import { recurrentTransactionRouter } from "./recurrent-transaction";
import { todoRouter } from "./todo";
import { transactionRouter } from "./transaction";
import { userSettingsRouter } from "./user-settings";

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        name: z.string().nullish(),
      }),
    )
    .query(({ input }) => {
      return {
        greeting: `Ciao ${input?.name ?? "ospite"}! Benvenuto nel tuo Gravio Manager.`,
      };
    }),

  getTestStats: protectedProcedure.query(({ ctx }) => {
    return {
      message:
        "Questo è un dato protetto recuperato con successo tramite tRPC!",
      userEmail: ctx.session.user.email,
      serverTime: new Date().toISOString(),
    };
  }),

  auth: authRouter,
  settings: userSettingsRouter,
  category: categoryRouter,
  transaction: transactionRouter,
  todo: todoRouter,
  friend: friendRouter,
  group: groupRouter,
  categoryBudget: categoryBudgetRouter,
  notification: notificationRouter,
  recurrentTransaction: recurrentTransactionRouter,
});

export type AppRouter = typeof appRouter;
