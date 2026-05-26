import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { categoryRouter } from "./category";
import { friendRouter } from "./friend";
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
        greeting: `Ciao ${input?.name ?? "ospite"}! Benvenuto nel tuo Erasmus Finance Manager.`,
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

  settings: userSettingsRouter,
  category: categoryRouter,
  transaction: transactionRouter,
  todo: todoRouter,
  friend: friendRouter,
});

export type AppRouter = typeof appRouter;
